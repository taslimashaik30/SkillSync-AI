from typing import TypedDict

from sqlalchemy import and_, func, select
from sqlalchemy.orm import aliased
from sqlalchemy.orm import Session

from ..models import EmployeeSkill, Skill, SkillGap
from .skill_demand import demand_based_required_level

DEFAULT_REQUIRED_LEVEL = 3


class CalculatedSkillGap(TypedDict):
    skill_id: int
    skill_name: str
    current_level: int
    required_level: int
    gap_score: int
    gap_level: str


def calculate_skill_gap(current_level: int, required_level: int) -> int:
    """Return the explainable shortfall; surplus proficiency is never negative."""
    return max(required_level - current_level, 0)


def classify_gap(gap_score: int) -> str:
    if gap_score == 0:
        return "No Gap"
    if gap_score == 1:
        return "Low"
    if gap_score == 2:
        return "Medium"
    return "High"


def calculate_employee_skill_gaps(db: Session, user_id: int) -> list[CalculatedSkillGap]:
    """Calculate current gaps without updating the existing skill_gaps snapshots.

    The current schema has no role-to-skill requirement mapping. For every
    employee skill, requirements are resolved in this order: a user-specific
    SkillGap requirement, the highest existing requirement for that skill, the
    supplied dataset's normalized demand for matching skills, and finally the
    documented Intermediate-level default (3). This is read-only.
    """
    own_gap = aliased(SkillGap)
    per_skill_requirement = (
        select(
            SkillGap.skill_id.label("skill_id"),
            func.max(SkillGap.required_level).label("required_level"),
        )
        .group_by(SkillGap.skill_id)
        .subquery()
    )
    rows = db.execute(
        select(
            EmployeeSkill,
            Skill,
            own_gap.required_level.label("user_required_level"),
            per_skill_requirement.c.required_level.label("skill_required_level"),
        )
        .join(Skill, Skill.id == EmployeeSkill.skill_id)
        .outerjoin(
            own_gap,
            and_(
                own_gap.user_id == user_id,
                own_gap.skill_id == EmployeeSkill.skill_id,
            ),
        )
        .outerjoin(
            per_skill_requirement,
            per_skill_requirement.c.skill_id == EmployeeSkill.skill_id,
        )
        .where(EmployeeSkill.user_id == user_id)
        .order_by(Skill.name)
    ).all()

    results: list[CalculatedSkillGap] = []
    for employee_skill, skill, user_required_level, skill_required_level in rows:
        current_level = int(employee_skill.proficiency_level)
        stored_requirement = user_required_level or skill_required_level
        required_level = (
            int(stored_requirement)
            if stored_requirement is not None
            else demand_based_required_level(skill.name, DEFAULT_REQUIRED_LEVEL)
        )
        gap_score = calculate_skill_gap(current_level, required_level)
        results.append(
            {
                "skill_id": skill.id,
                "skill_name": skill.name,
                "current_level": current_level,
                "required_level": required_level,
                "gap_score": gap_score,
                "gap_level": classify_gap(gap_score),
            }
        )
    return results
