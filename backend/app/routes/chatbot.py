from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.dependencies import get_current_user
from ..database.database import get_db
from ..models import ChatMessage, User
from ..schemas.chat import ChatHistoryItem, ChatRequest, ChatResponse, ChatSource, IngestMaterialRequest, IngestMaterialResponse
from ..services.chatbot import answer_chat_question
from ..services.rag_service import ingest_pdf_material

router = APIRouter(prefix="/api/chat", tags=["chat"])
UPLOADS_DIR = Path(__file__).resolve().parents[2] / "uploads"


def _safe_material_path(filename: str) -> Path:
    if Path(filename).name != filename or not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only safe PDF filenames are allowed")
    path = UPLOADS_DIR / filename
    if not path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learning material not found")
    return path


@router.post("/ingest-material", response_model=IngestMaterialResponse, status_code=status.HTTP_201_CREATED)
def ingest_material(
    payload: IngestMaterialRequest,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> IngestMaterialResponse:
    try:
        chunks_stored = ingest_pdf_material(db, _safe_material_path(payload.filename))
    except Exception:
        db.rollback()
        raise
    return IngestMaterialResponse(filename=payload.filename, chunks_stored=chunks_stored)


@router.post("", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ChatResponse:
    question = payload.message.strip()
    if not question:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Message must not be blank")
    answer, chunks = answer_chat_question(db, current_user, question)
    db.add_all([
        ChatMessage(user_id=current_user.id, role="user", message=question),
        ChatMessage(user_id=current_user.id, role="assistant", message=answer),
    ])
    db.commit()
    return ChatResponse(answer=answer, sources=[ChatSource(filename=chunk.filename, chunk_index=chunk.chunk_index) for chunk in chunks])


@router.get("/history", response_model=list[ChatHistoryItem])
def chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ChatMessage]:
    return list(db.scalars(select(ChatMessage).where(ChatMessage.user_id == current_user.id).order_by(ChatMessage.created_at.desc()).limit(100)))
