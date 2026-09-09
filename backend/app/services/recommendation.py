from typing import TypedDict

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Course, CourseSkill
from .skill_gap import calculate_employee_skill_gaps


class GeneratedRecommendation(TypedDict):
    resource_id: int
    resource_title: str
    resource_type: str
    skill_id: int
    skill_name: str
    current_level: int
    required_level: int
    gap_score: int
    gap_level: str
    recommendation_score: float
    reason: str


def calculate_recommendation_score(gap_score: int, relevance_score: float) -> float:
    """Score a resource from 0 to 100: 60% gap priority, 40% skill match."""
    gap_component = min(max(gap_score, 0), 5) / 5 * 60
    match_component = min(max(relevance_score, 0.0), 1.0) * 40
    return round(gap_component + match_component, 2)


def generate_employee_recommendations(db: Session, user_id: int) -> list[GeneratedRecommendation]:
    """Generate course recommendations in memory from the user's live gaps.

    `nssta_training` currently has no skill mapping, so it is intentionally not
    included until a schema-supported relationship is available.
    """
    unique_recommendations: dict[tuple[str, int], GeneratedRecommendation] = {}
    for gap in calculate_employee_skill_gaps(db, user_id):
        if gap["gap_score"] <= 0:
            continue
        matches = db.execute(
            select(Course, CourseSkill)
            .join(CourseSkill, CourseSkill.course_id == Course.id)
            .where(CourseSkill.skill_id == gap["skill_id"])
        ).all()
        for course, course_skill in matches:
            score = calculate_recommendation_score(gap["gap_score"], float(course_skill.relevance_score))
            candidate: GeneratedRecommendation = {
                "resource_id": course.id,
                "resource_title": course.title,
                "resource_type": "course",
                "skill_id": gap["skill_id"],
                "skill_name": gap["skill_name"],
                "current_level": gap["current_level"],
                "required_level": gap["required_level"],
                "gap_score": gap["gap_score"],
                "gap_level": gap["gap_level"],
                "recommendation_score": score,
                "reason": (
                    f"Matches {gap['skill_name']} and addresses your "
                    f"{gap['gap_level'].lower()} skill gap."
                ),
            }
            key = ("course", course.id)
            previous = unique_recommendations.get(key)
            if previous is None or candidate["recommendation_score"] > previous["recommendation_score"]:
                unique_recommendations[key] = candidate

    return sorted(
        unique_recommendations.values(),
        key=lambda recommendation: recommendation["recommendation_score"],
        reverse=True,
    )
