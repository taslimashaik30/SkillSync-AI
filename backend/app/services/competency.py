"""Keep a user's assessed skill proficiency in the existing competency record."""

from sqlalchemy import func
from sqlalchemy.orm import Session

from ..models import EmployeeSkill


def proficiency_from_assessment_percentage(percentage: float) -> int:
    """Map an objective assessment result to the schema's 1--5 proficiency scale."""
    if percentage >= 90:
        return 5
    if percentage >= 80:
        return 4
    if percentage >= 60:
        return 3
    if percentage >= 40:
        return 2
    return 1


def update_employee_skill_from_assessment(
    db: Session, user_id: int, skill_id: int, percentage: float
) -> EmployeeSkill:
    """Upsert a score-derived proficiency without lowering an established level.

    The caller owns the transaction so the assessment result and proficiency
    change are committed atomically.
    """
    assessed_level = proficiency_from_assessment_percentage(float(percentage))
    employee_skill = db.get(EmployeeSkill, (user_id, skill_id))
    if employee_skill is None:
        employee_skill = EmployeeSkill(
            user_id=user_id,
            skill_id=skill_id,
            proficiency_level=assessed_level,
        )
        db.add(employee_skill)
        return employee_skill

    employee_skill.proficiency_level = max(
        int(employee_skill.proficiency_level), assessed_level
    )
    employee_skill.assessed_at = func.now()
    return employee_skill
