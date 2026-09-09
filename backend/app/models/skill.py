from typing import TYPE_CHECKING
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database.base import Base
if TYPE_CHECKING: from .employee_skill import EmployeeSkill; from .skill_gap import SkillGap; from .course_skill import CourseSkill; from .assessment_question import AssessmentQuestion
class Skill(Base):
    __tablename__ = "skills"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150), unique=True)
    category: Mapped[str] = mapped_column(String(100), index=True)
    description: Mapped[str | None] = mapped_column(Text)
    employee_skills: Mapped[list["EmployeeSkill"]] = relationship(back_populates="skill")
    skill_gaps: Mapped[list["SkillGap"]] = relationship(back_populates="skill")
    course_skills: Mapped[list["CourseSkill"]] = relationship(back_populates="skill")
    assessment_questions: Mapped[list["AssessmentQuestion"]] = relationship(back_populates="skill")
