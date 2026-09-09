from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database.base import Base
if TYPE_CHECKING: from .user import User; from .course import Course; from .nssta_training import NSSTATraining
class LearningHistory(Base):
    __tablename__ = "learning_history"
    id: Mapped[int] = mapped_column(primary_key=True); user_id: Mapped[int] = mapped_column(ForeignKey("users.id")); course_id: Mapped[int | None] = mapped_column(ForeignKey("courses.id")); nssta_training_id: Mapped[int | None] = mapped_column(ForeignKey("nssta_training.id")); status: Mapped[str] = mapped_column(String(20)); progress_percentage: Mapped[float] = mapped_column(Numeric(5,2), default=0); score: Mapped[float | None] = mapped_column(Numeric(5,2)); started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True)); completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    user: Mapped["User"] = relationship(back_populates="learning_history"); course: Mapped["Course | None"] = relationship(back_populates="learning_history"); nssta_training: Mapped["NSSTATraining | None"] = relationship(back_populates="learning_history")
