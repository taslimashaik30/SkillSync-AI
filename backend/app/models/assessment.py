from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database.base import Base
if TYPE_CHECKING: from .user import User; from .assessment_question import AssessmentQuestion; from .assessment_result import AssessmentResult
class Assessment(Base):
    __tablename__ = "assessments"
    id: Mapped[int] = mapped_column(primary_key=True); user_id: Mapped[int] = mapped_column(ForeignKey("users.id")); title: Mapped[str] = mapped_column(String(255)); assessment_type: Mapped[str] = mapped_column(String(100)); total_questions: Mapped[int] = mapped_column(Integer, default=0); total_score: Mapped[float | None] = mapped_column(Numeric(8,2)); created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now()); completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    user: Mapped["User"] = relationship(back_populates="assessments"); questions: Mapped[list["AssessmentQuestion"]] = relationship(back_populates="assessment", cascade="all, delete-orphan"); results: Mapped[list["AssessmentResult"]] = relationship(back_populates="assessment", cascade="all, delete-orphan")
