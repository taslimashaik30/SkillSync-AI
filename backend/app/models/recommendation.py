from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database.base import Base
if TYPE_CHECKING: from .user import User; from .course import Course; from .nssta_training import NSSTATraining
class Recommendation(Base):
    __tablename__ = "recommendations"
    id: Mapped[int] = mapped_column(primary_key=True); user_id: Mapped[int] = mapped_column(ForeignKey("users.id")); course_id: Mapped[int | None] = mapped_column(ForeignKey("courses.id")); nssta_training_id: Mapped[int | None] = mapped_column(ForeignKey("nssta_training.id")); recommendation_score: Mapped[float] = mapped_column(Numeric(5,2)); reason: Mapped[str] = mapped_column(Text); status: Mapped[str] = mapped_column(String(20), default="pending"); created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    user: Mapped["User"] = relationship(back_populates="recommendations"); course: Mapped["Course | None"] = relationship(back_populates="recommendations"); nssta_training: Mapped["NSSTATraining | None"] = relationship(back_populates="recommendations")
