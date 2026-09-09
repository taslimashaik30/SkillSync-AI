from pydantic import BaseModel, Field


class RecommendationResponse(BaseModel):
    resource_id: int
    resource_title: str
    resource_type: str
    skill_id: int
    skill_name: str
    current_level: int = Field(ge=0, le=5)
    required_level: int = Field(ge=1, le=5)
    gap_score: int = Field(ge=1)
    gap_level: str
    recommendation_score: float = Field(ge=0, le=100)
    reason: str


class RecommendationReport(BaseModel):
    user_id: int
    recommendations: list[RecommendationResponse]
