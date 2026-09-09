from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import CheckConstraint, DateTime, ForeignKey, SmallInteger, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database.base import Base
if TYPE_CHECKING: from .user import User; from .skill import Skill
class EmployeeSkill(Base):
    __tablename__ = "employee_skills"; __table_args__ = (CheckConstraint("proficiency_level BETWEEN 1 AND 5"),)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"), primary_key=True)
    proficiency_level: Mapped[int] = mapped_column(SmallInteger)
    assessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    user: Mapped["User"] = relationship(back_populates="employee_skills")
    skill: Mapped["Skill"] = relationship(back_populates="employee_skills")
