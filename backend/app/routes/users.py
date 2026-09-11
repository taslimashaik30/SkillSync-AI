from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..core.dependencies import get_current_user
from ..database.database import get_db
from ..models import AssessmentResult, EmployeeSkill, LearningHistory, Skill, User
from ..schemas.employee_skill import EmployeeSkillCreate, EmployeeSkillResponse, EmployeeSkillUpdate
from ..schemas.user import UserProfileUpdate, UserResponse, UserStatsResponse

router = APIRouter(prefix="/api/users", tags=["users"])


def _employee_skill_response(record: EmployeeSkill, skill: Skill) -> EmployeeSkillResponse:
    return EmployeeSkillResponse(
        skill_id=skill.id,
        skill_name=skill.name,
        skill_category=skill.category,
        proficiency_level=record.proficiency_level,
        assessed_at=record.assessed_at,
    )


@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.put("/me", response_model=UserResponse)
def update_my_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    changes = payload.model_dump(exclude_unset=True)
    for field, value in changes.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/me/stats", response_model=UserStatsResponse)
def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserStatsResponse:
    average_level = db.scalar(
        select(func.avg(EmployeeSkill.proficiency_level)).where(
            EmployeeSkill.user_id == current_user.id
        )
    )
    courses_completed = db.scalar(
        select(func.count(LearningHistory.id)).where(
            LearningHistory.user_id == current_user.id,
            LearningHistory.course_id.is_not(None),
            LearningHistory.status == "completed",
        )
    )
    courses_in_progress = db.scalar(
        select(func.count(LearningHistory.id)).where(
            LearningHistory.user_id == current_user.id,
            LearningHistory.course_id.is_not(None),
            LearningHistory.status == "in_progress",
        )
    )
    assessments_taken = db.scalar(
        select(func.count(AssessmentResult.id)).where(
            AssessmentResult.user_id == current_user.id
        )
    )
    # learning_history has completion/progress, but no elapsed-learning-time
    # field. Course duration is catalogue metadata, not actual user time.
    return UserStatsResponse(
        average_competency=round(float(average_level or 0) * 20, 2),
        courses_completed=int(courses_completed or 0),
        courses_in_progress=int(courses_in_progress or 0),
        hours_invested=0,
        assessments_taken=int(assessments_taken or 0),
    )


@router.get("/me/skills", response_model=list[EmployeeSkillResponse])
def list_my_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[EmployeeSkillResponse]:
    rows = db.execute(
        select(EmployeeSkill, Skill)
        .join(Skill, EmployeeSkill.skill_id == Skill.id)
        .where(EmployeeSkill.user_id == current_user.id)
        .order_by(Skill.name)
    ).all()
    return [_employee_skill_response(record, skill) for record, skill in rows]


@router.post("/me/skills", response_model=EmployeeSkillResponse, status_code=status.HTTP_201_CREATED)
def add_my_skill(
    payload: EmployeeSkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> EmployeeSkillResponse:
    skill = db.get(Skill, payload.skill_id)
    if skill is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    if db.get(EmployeeSkill, (current_user.id, payload.skill_id)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Skill already exists in your profile")
    record = EmployeeSkill(user_id=current_user.id, skill_id=payload.skill_id, proficiency_level=payload.proficiency_level)
    db.add(record)
    db.commit()
    db.refresh(record)
    return _employee_skill_response(record, skill)


@router.put("/me/skills/{skill_id}", response_model=EmployeeSkillResponse)
def update_my_skill(
    skill_id: int,
    payload: EmployeeSkillUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> EmployeeSkillResponse:
    record = db.get(EmployeeSkill, (current_user.id, skill_id))
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill is not in your profile")
    skill = db.get(Skill, skill_id)
    if skill is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    record.proficiency_level = payload.proficiency_level
    record.assessed_at = func.now()
    db.commit()
    db.refresh(record)
    return _employee_skill_response(record, skill)


@router.delete("/me/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_my_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    record = db.get(EmployeeSkill, (current_user.id, skill_id))
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill is not in your profile")
    db.delete(record)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
