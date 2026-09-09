from typing import TypedDict

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from ..models import EmployeeSkill, Skill, SkillGap


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

    The current schema has no role-to-skill requirement mapping. Existing
    SkillGap.required_level records are therefore used as the user's required
    skill baseline, while employee_skills supplies the live current level.
    """
    rows = db.execute(
        select(SkillGap, Skill, EmployeeSkill.proficiency_level)
        .join(Skill, Skill.id == SkillGap.skill_id)
        .outerjoin(
            EmployeeSkill,
            and_(
                EmployeeSkill.user_id == user_id,
                EmployeeSkill.skill_id == SkillGap.skill_id,
            ),
        )
        .where(SkillGap.user_id == user_id)
        .order_by(Skill.name)
    ).all()

    results: list[CalculatedSkillGap] = []
    for stored_gap, skill, live_level in rows:
        current_level = int(live_level) if live_level is not None else 0
        required_level = int(stored_gap.required_level)
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
