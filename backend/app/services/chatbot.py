"""General and user-contextual chat orchestration for the existing chat route."""

import os

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import DocumentChunk, EmployeeSkill, Skill, User
from .learning_path import build_learning_path
from .rag_service import CHAT_MODEL, search_similar_chunks
from .recommendation import generate_employee_recommendations
from .skill_gap import calculate_employee_skill_gaps


def _user_context(db: Session, user: User) -> str:
    skills = db.execute(
        select(EmployeeSkill, Skill)
        .join(Skill, Skill.id == EmployeeSkill.skill_id)
        .where(EmployeeSkill.user_id == user.id)
        .order_by(Skill.name)
    ).all()
    skill_text = ", ".join(f"{skill.name} (level {record.proficiency_level}/5)" for record, skill in skills) or "No skills are recorded."
    gaps = calculate_employee_skill_gaps(db, user.id)
    gap_text = "; ".join(f"{gap['skill_name']}: {gap['gap_level']} gap ({gap['current_level']}/{gap['required_level']})" for gap in gaps if gap["gap_score"] > 0) or "No active skill gaps are recorded."
    recommendations = generate_employee_recommendations(db, user.id)
    recommendation_text = "; ".join(item["resource_title"] for item in recommendations[:5]) or "No matching course recommendations are available."
    path = build_learning_path(db, user.id)
    path_text = "; ".join(f"{item['title']} ({item['status']}, {item['progress']}%)" for item in path[:5]) or "No learning path is currently available."
    return (
        f"Authenticated learner profile: name={user.name}; department={user.department or 'not recorded'}; "
        f"designation={user.designation or 'not recorded'}.\n"
        f"Recorded skills: {skill_text}\n"
        f"Skill gaps: {gap_text}\n"
        f"Recommended courses: {recommendation_text}\n"
        f"Learning path: {path_text}"
    )


def answer_chat_question(db: Session, user: User, question: str) -> tuple[str, list]:
    """Answer general questions while grounding personal details in the caller's data."""
    context = _user_context(db, user)
    chunks = []
    if db.scalar(select(DocumentChunk.id).limit(1)) is not None:
        try:
            chunks = search_similar_chunks(db, question)
        except HTTPException:
            # General and profile assistance remains available if optional RAG
            # retrieval is temporarily unavailable.
            chunks = []
    material_context = "\n\n".join(f"[Learning material: {chunk.filename}, section {chunk.chunk_index}]\n{chunk.content}" for chunk in chunks)
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Gemini is not configured")
    prompt = f"""You are SkillSync-AI, a helpful general technology and learning assistant.
Answer general technology, career, and learning questions accurately using your general knowledge.
For questions about the learner, rely only on the authenticated learner context below; never invent missing profile data or claim another user's data.
When learning material context is relevant, use it and say when it does not contain the requested information.
Be concise, practical, and clear.

Authenticated learner context:
{context}

Relevant uploaded learning material (may be empty):
{material_context or 'None'}

Question:
{question}"""
    try:
        from google import genai
        from google.genai import types

        # Keep the SDK client alive for the whole request. The google-genai
        # client can otherwise be finalized before its HTTP request completes.
        client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(
                retry_options=types.HttpRetryOptions(attempts=1),
            ),
        )
        # Use a chat session for assistant turns. This is the google-genai
        # recommended path when automatic function calling is enabled.
        chat = client.chats.create(
            model=CHAT_MODEL,
            config=types.GenerateContentConfig(
                automatic_function_calling=types.AutomaticFunctionCallingConfig(
                    disable=False,
                ),
            ),
        )
        response = chat.send_message(prompt)
        answer = (response.text or "").strip()
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI assistant response generation failed") from exc
    if not answer:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI assistant returned no answer")
    return answer, chunks
