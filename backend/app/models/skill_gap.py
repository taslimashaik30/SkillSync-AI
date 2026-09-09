from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Numeric, SmallInteger, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database.base import Base
if TYPE_CHECKING: from .user import User; from .skill import Skill
class SkillGap(Base):
    __tablename__ = "skill_gaps"; __table_args__ = (UniqueConstraint("user_id", "skill_id"), CheckConstraint("current_level BETWEEN 1 AND 5"), CheckConstraint("required_level BETWEEN 1 AND 5"))
    id: Mapped[int] = mapped_column(primary_key=True); user_id: Mapped[int] = mapped_column(ForeignKey("users.id")); skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"))
    current_level: Mapped[int] = mapped_column(SmallInteger); required_level: Mapped[int] = mapped_column(SmallInteger); gap_score: Mapped[float] = mapped_column(Numeric(5, 2)); priority: Mapped[str] = mapped_column(String(20)); identified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    user: Mapped["User"] = relationship(back_populates="skill_gaps"); skill: Mapped["Skill"] = relationship(back_populates="skill_gaps")
