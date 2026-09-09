from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database.base import Base
if TYPE_CHECKING: from .assessment import Assessment; from .user import User
class AssessmentResult(Base):
    __tablename__ = "assessment_results"; __table_args__ = (UniqueConstraint("assessment_id", "user_id"),)
    id: Mapped[int] = mapped_column(primary_key=True); assessment_id: Mapped[int] = mapped_column(ForeignKey("assessments.id")); user_id: Mapped[int] = mapped_column(ForeignKey("users.id")); score: Mapped[float] = mapped_column(Numeric(8,2)); percentage: Mapped[float] = mapped_column(Numeric(5,2)); passed: Mapped[bool] = mapped_column(Boolean); completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    assessment: Mapped["Assessment"] = relationship(back_populates="results"); user: Mapped["User"] = relationship(back_populates="assessment_results")
