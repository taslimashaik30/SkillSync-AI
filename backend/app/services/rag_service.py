import os
import re
import logging
from pathlib import Path

from fastapi import HTTPException, status
from dotenv import load_dotenv
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import DocumentChunk
from .pdf_extractor import extract_text_from_pdf

load_dotenv()
logger = logging.getLogger(__name__)

EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSIONS = 768
CHAT_MODEL = os.getenv("GEMINI_CHAT_MODEL", "gemini-3.6-flash")


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 150) -> list[str]:
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        if end < len(text):
            boundary = text.rfind(" ", start, end)
            if boundary > start + chunk_size // 2:
                end = boundary
        chunks.append(text[start:end].strip())
        if end >= len(text):
            break
        start = max(end - overlap, start + 1)
    return chunks


def generate_embedding(text: str, task_type: str) -> list[float]:
    return generate_embeddings([text], task_type)[0]


def generate_embeddings(texts: list[str], task_type: str) -> list[list[float]]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Gemini is not configured")
    if not texts or any(not text.strip() for text in texts):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Embedding text must not be empty")
    try:
        from google import genai
        from google.genai import types

        # Keep the SDK client alive for the entire synchronous request. With
        # google-genai 2.x, an inline temporary client can be finalized before
        # the HTTP request finishes and raise "client has been closed".
        client = genai.Client(api_key=api_key)
        result = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=texts,
            config=types.EmbedContentConfig(task_type=task_type, output_dimensionality=EMBEDDING_DIMENSIONS),
        )
        embeddings = [[float(value) for value in embedding.values] for embedding in result.embeddings]
    except Exception as exc:
        logger.exception("Gemini embedding request failed (%s)", type(exc).__name__)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Embedding generation failed") from exc
    if len(embeddings) != len(texts) or any(len(values) != EMBEDDING_DIMENSIONS for values in embeddings):
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Embedding dimension is invalid")
    return embeddings


def store_document_chunks(db: Session, filename: str, text: str) -> int:
    if db.scalar(select(DocumentChunk.id).where(DocumentChunk.filename == filename)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Learning material has already been ingested")
    chunks = chunk_text(text)
    if not chunks:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Learning material contains no usable text")
    try:
        embeddings: list[list[float]] = []
        batch_size = 20
        for start in range(0, len(chunks), batch_size):
            embeddings.extend(generate_embeddings(chunks[start : start + batch_size], "RETRIEVAL_DOCUMENT"))
        for index, (content, embedding) in enumerate(zip(chunks, embeddings, strict=True)):
            db.add(DocumentChunk(filename=filename, chunk_index=index, content=content, embedding=embedding))
        db.commit()
    except Exception:
        db.rollback()
        raise
    return len(chunks)


def ingest_pdf_material(db: Session, file_path: Path) -> int:
    return store_document_chunks(db, file_path.name, extract_text_from_pdf(file_path))


def search_similar_chunks(db: Session, question: str, limit: int = 4) -> list[DocumentChunk]:
    if db.scalar(select(DocumentChunk.id).limit(1)) is None:
        return []
    embedding = generate_embedding(question, "RETRIEVAL_QUERY")
    distance = DocumentChunk.embedding.cosine_distance(embedding)
    return list(db.scalars(select(DocumentChunk).order_by(distance).limit(limit)))


def generate_rag_answer(question: str, chunks: list[DocumentChunk]) -> str:
    if not chunks:
        return "The information is not available in the provided learning material."
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Gemini is not configured")
    context = "\n\n".join(f"[Source: {chunk.filename}, section {chunk.chunk_index}]\n{chunk.content}" for chunk in chunks)
    prompt = f"""You are an AI learning assistant for SkillSync-AI. Answer only from the supplied learning material context. If the answer is not present, say that it is not available in the provided learning material. Do not invent facts. Explain clearly and educationally.

Context:
{context}

Question:
{question}"""
    from google import genai
    from google.genai import types
    from time import sleep

    # The SDK itself retries requests by default. Keep its retry count to one
    # here so the explicit 2/4/8-second RAG retry policy remains bounded.
    client = genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(
            retry_options=types.HttpRetryOptions(attempts=1),
        ),
    )
    retry_delays = (2, 4, 8)
    for attempt in range(len(retry_delays) + 1):
        try:
            response = client.models.generate_content(model=CHAT_MODEL, contents=prompt)
            answer = response.text.strip()
            if not answer:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Grounded answer generation returned no answer",
                )
            return answer
        except HTTPException:
            raise
        except Exception as exc:
            message = str(exc).upper()
            transient = getattr(exc, "status_code", None) == 503 or "UNAVAILABLE" in message or "HIGH DEMAND" in message
            if not transient:
                logger.exception("Gemini grounded-answer request failed (%s)", type(exc).__name__)
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Grounded answer generation failed",
                ) from exc
            if attempt == len(retry_delays):
                logger.warning("Gemini remained unavailable after %s attempts", attempt + 1, exc_info=True)
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Gemini is temporarily unavailable. Please try again shortly.",
                ) from exc
            delay = retry_delays[attempt]
            logger.warning("Gemini unavailable; retrying grounded answer in %s seconds", delay)
            sleep(delay)

    raise RuntimeError("Unreachable retry state")
