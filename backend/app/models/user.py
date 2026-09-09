from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database.base import Base

if TYPE_CHECKING:
    from .role import Role
    from .assessment import Assessment
    from .assessment_result import AssessmentResult
    from .employee_skill import EmployeeSkill
    from .learning_history import LearningHistory
    from .recommendation import Recommendation
    from .skill_gap import SkillGap


class User(Base):
    """ORM mapping for the pre-existing Neon `users` table."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        nullable=False
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    role_id: Mapped[int] = mapped_column(
        ForeignKey("roles.id", ondelete="RESTRICT"),
        nullable=False
    )

    employee_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False
    )

    department: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True
    )

    designation: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    role: Mapped["Role"] = relationship("Role", back_populates="users")

    assessments: Mapped[list["Assessment"]] = relationship(
        "Assessment", back_populates="user"
    )

    assessment_results: Mapped[list["AssessmentResult"]] = relationship(
        "AssessmentResult", back_populates="user"
    )

    employee_skills: Mapped[list["EmployeeSkill"]] = relationship(
        "EmployeeSkill", back_populates="user"
    )

    skill_gaps: Mapped[list["SkillGap"]] = relationship(
        "SkillGap", back_populates="user"
    )

    learning_history: Mapped[list["LearningHistory"]] = relationship(
        "LearningHistory", back_populates="user"
    )

    recommendations: Mapped[list["Recommendation"]] = relationship(
        "Recommendation", back_populates="user"
    )
