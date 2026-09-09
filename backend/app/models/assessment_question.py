from typing import TYPE_CHECKING
from sqlalchemy import CHAR, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database.base import Base
if TYPE_CHECKING: from .assessment import Assessment; from .skill import Skill
class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"
    id: Mapped[int] = mapped_column(primary_key=True); assessment_id: Mapped[int] = mapped_column(ForeignKey("assessments.id")); question_text: Mapped[str] = mapped_column(Text); option_a: Mapped[str] = mapped_column(Text); option_b: Mapped[str] = mapped_column(Text); option_c: Mapped[str] = mapped_column(Text); option_d: Mapped[str] = mapped_column(Text); correct_option: Mapped[str] = mapped_column(CHAR(1)); explanation: Mapped[str | None] = mapped_column(Text); skill_id: Mapped[int | None] = mapped_column(ForeignKey("skills.id"))
    assessment: Mapped["Assessment"] = relationship(back_populates="questions"); skill: Mapped["Skill | None"] = relationship(back_populates="assessment_questions")
