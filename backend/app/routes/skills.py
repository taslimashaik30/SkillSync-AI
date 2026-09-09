from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..core.dependencies import require_role
from ..database.database import get_db
from ..models import Skill
from ..schemas.skill import SkillCreate, SkillResponse, SkillUpdate

router = APIRouter(prefix="/api/skills", tags=["skills"])


def _get_skill_or_404(skill_id: int, db: Session) -> Skill:
    skill = db.get(Skill, skill_id)
    if skill is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    return skill


@router.get("", response_model=list[SkillResponse])
def list_skills(
    q: str | None = Query(default=None, max_length=150),
    category: str | None = Query(default=None, max_length=100),
    db: Session = Depends(get_db),
) -> list[Skill]:
    statement = select(Skill).order_by(Skill.name)
    if q:
        pattern = f"%{q.strip()}%"
        statement = statement.where(or_(Skill.name.ilike(pattern), Skill.description.ilike(pattern)))
    if category:
        statement = statement.where(Skill.category.ilike(category.strip()))
    return list(db.scalars(statement))


@router.get("/{skill_id}", response_model=SkillResponse)
def get_skill(skill_id: int, db: Session = Depends(get_db)) -> Skill:
    return _get_skill_or_404(skill_id, db)


@router.post("", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(
    payload: SkillCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_role("admin")),
) -> Skill:
    if db.scalar(select(Skill.id).where(Skill.name == payload.name)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Skill name already exists")
    skill = Skill(**payload.model_dump())
    db.add(skill)
    try:
        db.commit()
        db.refresh(skill)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Skill name already exists")
    return skill


@router.put("/{skill_id}", response_model=SkillResponse)
def update_skill(
    skill_id: int,
    payload: SkillUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_role("admin")),
) -> Skill:
    skill = _get_skill_or_404(skill_id, db)
    changes = payload.model_dump(exclude_unset=True)
    if "name" in changes and db.scalar(select(Skill.id).where(Skill.name == changes["name"], Skill.id != skill_id)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Skill name already exists")
    for field, value in changes.items():
        setattr(skill, field, value)
    db.commit()
    db.refresh(skill)
    return skill


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_role("admin")),
) -> Response:
    skill = _get_skill_or_404(skill_id, db)
    db.delete(skill)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Skill is referenced and cannot be deleted")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
