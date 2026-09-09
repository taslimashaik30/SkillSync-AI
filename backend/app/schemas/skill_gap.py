from pydantic import BaseModel, Field


class SkillGapResponse(BaseModel):
    skill_id: int
    skill_name: str
    current_level: int = Field(ge=0, le=5)
    required_level: int = Field(ge=1, le=5)
    gap_score: int = Field(ge=0)
    gap_level: str


class SkillGapSummary(BaseModel):
    total_skills: int
    skills_with_gaps: int
    high_gaps: int
    medium_gaps: int
    low_gaps: int


class EmployeeSkillGapReport(BaseModel):
    user_id: int
    gaps: list[SkillGapResponse]
    summary: SkillGapSummary
