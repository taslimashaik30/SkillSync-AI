from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..core.dependencies import get_current_user
from ..database.database import get_db
from ..models import User
from ..schemas.recommendation import RecommendationReport, RecommendationResponse
from ..services.recommendation import generate_employee_recommendations

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.get("", response_model=RecommendationReport)
def get_my_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RecommendationReport:
    recommendations = generate_employee_recommendations(db, current_user.id)
    return RecommendationReport(
        user_id=current_user.id,
        recommendations=[RecommendationResponse(**item) for item in recommendations],
    )
