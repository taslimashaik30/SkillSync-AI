from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from .database.database import get_db
from .routes.auth import router as auth_router
from .routes.assessments import router as assessments_router
from .routes.chatbot import router as chat_router
from .routes.courses import router as courses_router
from .routes.competencies import router as competencies_router
from .routes.skill_gaps import router as skill_gaps_router
from .routes.skills import router as skills_router
from .routes.recommendations import router as recommendations_router
from .routes.users import router as users_router

app = FastAPI(
    title="SkillSync-AI API",
    description="Backend API for the SIH 26101 AI-enabled Skill Intelligence and Learning Platform.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(assessments_router)
app.include_router(chat_router)
app.include_router(courses_router)
app.include_router(skills_router)
app.include_router(competencies_router)
app.include_router(skill_gaps_router)
app.include_router(recommendations_router)
app.include_router(users_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "SkillSync-AI API is running"}


@app.get("/health")
def health(db: Session = Depends(get_db)) -> dict[str, str]:
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")
    return {"status": "healthy", "database": "connected"}
