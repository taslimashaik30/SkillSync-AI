from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database.base import Base
if TYPE_CHECKING: from .course_skill import CourseSkill; from .learning_history import LearningHistory; from .recommendation import Recommendation
class Course(Base):
    __tablename__ = "courses"
    id: Mapped[int] = mapped_column(primary_key=True); title: Mapped[str] = mapped_column(String(255)); description: Mapped[str | None] = mapped_column(Text); provider: Mapped[str] = mapped_column(String(150)); source: Mapped[str] = mapped_column(String(50), index=True); external_course_id: Mapped[str | None] = mapped_column(String(150)); category: Mapped[str | None] = mapped_column(String(100)); difficulty: Mapped[str | None] = mapped_column(String(30)); duration_minutes: Mapped[int | None] = mapped_column(Integer); url: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now()); updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    course_skills: Mapped[list["CourseSkill"]] = relationship(back_populates="course", cascade="all, delete-orphan"); learning_history: Mapped[list["LearningHistory"]] = relationship(back_populates="course"); recommendations: Mapped[list["Recommendation"]] = relationship(back_populates="course")
