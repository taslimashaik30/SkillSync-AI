"""Build a user's learning path from existing recommendation and history data."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Course, LearningHistory
from .recommendation import generate_employee_recommendations


def build_learning_path(db: Session, user_id: int) -> list[dict]:
    """Return only real recommended courses and their real recorded progress."""
    recommendations = generate_employee_recommendations(db, user_id)
    course_skills: dict[int, list[str]] = {}
    course_ids: list[int] = []
    for recommendation in recommendations:
        course_id = recommendation["resource_id"]
        if course_id not in course_skills:
            course_ids.append(course_id)
            course_skills[course_id] = []
        if recommendation["skill_name"] not in course_skills[course_id]:
            course_skills[course_id].append(recommendation["skill_name"])

    if not course_ids:
        return []

    courses = {
        course.id: course
        for course in db.scalars(select(Course).where(Course.id.in_(course_ids)))
    }
    history = {
        record.course_id: record
        for record in db.scalars(
            select(LearningHistory).where(
                LearningHistory.user_id == user_id,
                LearningHistory.course_id.in_(course_ids),
            )
        )
        if record.course_id is not None
    }

    path = []
    for course_id in course_ids:
        course = courses.get(course_id)
        if course is None:
            continue
        record = history.get(course_id)
        progress = float(record.progress_percentage) if record else 0.0
        status = record.status if record else "upcoming"
        path.append({
            "course_id": course.id,
            "title": course.title,
            "description": course.description,
            "category": course.category,
            "level": course.difficulty,
            "duration": f"{course.duration_minutes} min" if course.duration_minutes else None,
            "progress": progress,
            "status": status,
            "skills": course_skills[course_id],
        })
    return path
