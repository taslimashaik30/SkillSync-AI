from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database.base import Base
if TYPE_CHECKING: from .course import Course; from .skill import Skill
class CourseSkill(Base):
    __tablename__ = "course_skills"
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), primary_key=True); skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"), primary_key=True); relevance_score: Mapped[float] = mapped_column(Numeric(5,2), default=1)
    course: Mapped["Course"] = relationship(back_populates="course_skills"); skill: Mapped["Skill"] = relationship(back_populates="course_skills")
