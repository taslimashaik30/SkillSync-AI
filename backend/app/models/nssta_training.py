from datetime import date, datetime
from typing import TYPE_CHECKING
from sqlalchemy import Date, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database.base import Base
if TYPE_CHECKING: from .learning_history import LearningHistory; from .recommendation import Recommendation
class NSSTATraining(Base):
    __tablename__ = "nssta_training"
    id: Mapped[int] = mapped_column(primary_key=True); title: Mapped[str] = mapped_column(String(255)); description: Mapped[str | None] = mapped_column(Text); provider: Mapped[str] = mapped_column(String(150)); programme_type: Mapped[str] = mapped_column(String(100)); location: Mapped[str | None] = mapped_column(String(150)); start_date: Mapped[date | None] = mapped_column(Date); end_date: Mapped[date | None] = mapped_column(Date); duration_minutes: Mapped[int | None] = mapped_column(Integer); eligibility: Mapped[str | None] = mapped_column(Text); url: Mapped[str | None] = mapped_column(Text); created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    learning_history: Mapped[list["LearningHistory"]] = relationship(back_populates="nssta_training"); recommendations: Mapped[list["Recommendation"]] = relationship(back_populates="nssta_training")
