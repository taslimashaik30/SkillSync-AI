from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..core.dependencies import require_role
from ..database.database import get_db
from ..models import Competency
from ..schemas.competency import CompetencyCreate, CompetencyResponse, CompetencyUpdate

router = APIRouter(prefix="/api/competencies", tags=["competencies"])


def _get_competency_or_404(competency_id: int, db: Session) -> Competency:
    competency = db.get(Competency, competency_id)
    if competency is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Competency not found")
    return competency


@router.get("", response_model=list[CompetencyResponse])
def list_competencies(db: Session = Depends(get_db)) -> list[Competency]:
    return list(db.scalars(select(Competency).order_by(Competency.name)))


@router.get("/{competency_id}", response_model=CompetencyResponse)
def get_competency(competency_id: int, db: Session = Depends(get_db)) -> Competency:
    return _get_competency_or_404(competency_id, db)


@router.post("", response_model=CompetencyResponse, status_code=status.HTTP_201_CREATED)
def create_competency(
    payload: CompetencyCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_role("admin")),
) -> Competency:
    if db.scalar(select(Competency.id).where(Competency.name == payload.name)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Competency name already exists")
    competency = Competency(**payload.model_dump())
    db.add(competency)
    try:
        db.commit()
        db.refresh(competency)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Competency name already exists")
    return competency


@router.put("/{competency_id}", response_model=CompetencyResponse)
def update_competency(
    competency_id: int,
    payload: CompetencyUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_role("admin")),
) -> Competency:
    competency = _get_competency_or_404(competency_id, db)
    changes = payload.model_dump(exclude_unset=True)
    if "name" in changes and db.scalar(select(Competency.id).where(Competency.name == changes["name"], Competency.id != competency_id)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Competency name already exists")
    for field, value in changes.items():
        setattr(competency, field, value)
    db.commit()
    db.refresh(competency)
    return competency


@router.delete("/{competency_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_competency(
    competency_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_role("admin")),
) -> Response:
    competency = _get_competency_or_404(competency_id, db)
    db.delete(competency)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Competency cannot be deleted")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
