from fastapi import APIRouter, Depends

from ..core.dependencies import get_current_user
from ..database.database import get_db
from ..models import User
from ..schemas.skill_gap import EmployeeSkillGapReport, SkillGapResponse, SkillGapSummary
from ..services.skill_gap import calculate_employee_skill_gaps
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/skill-gaps", tags=["skill gaps"])


@router.get("", response_model=EmployeeSkillGapReport)
def get_my_skill_gaps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> EmployeeSkillGapReport:
    gaps = calculate_employee_skill_gaps(db, current_user.id)
    summary = SkillGapSummary(
        total_skills=len(gaps),
        skills_with_gaps=sum(gap["gap_score"] > 0 for gap in gaps),
        high_gaps=sum(gap["gap_level"] == "High" for gap in gaps),
        medium_gaps=sum(gap["gap_level"] == "Medium" for gap in gaps),
        low_gaps=sum(gap["gap_level"] == "Low" for gap in gaps),
    )
    return EmployeeSkillGapReport(
        user_id=current_user.id,
        gaps=[SkillGapResponse(**gap) for gap in gaps],
        summary=summary,
    )
