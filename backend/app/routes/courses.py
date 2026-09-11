from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.dependencies import get_current_user
from ..database.database import get_db
from ..models import Course, User
from ..schemas.course import CourseResponse, LearningPathResponse
from ..services.learning_path import build_learning_path


router = APIRouter(prefix="/api", tags=["courses"])


@router.get("/courses", response_model=list[CourseResponse])
def list_courses(db: Session = Depends(get_db)) -> list[Course]:
    return list(db.scalars(select(Course).order_by(Course.title)))


@router.get("/courses/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)) -> Course:
    course = db.get(Course, course_id)
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return course


@router.get("/learning-path", response_model=LearningPathResponse)
def get_learning_path(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LearningPathResponse:
    return LearningPathResponse(path=build_learning_path(db, current_user.id))
