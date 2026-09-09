from datetime import datetime
from pydantic import BaseModel, Field


class EmployeeSkillCreate(BaseModel):
    skill_id: int = Field(gt=0)
    proficiency_level: int = Field(ge=1, le=5, description="1=Beginner, 2=Basic, 3=Intermediate, 4=Advanced, 5=Expert")


class EmployeeSkillUpdate(BaseModel):
    proficiency_level: int = Field(ge=1, le=5, description="1=Beginner, 2=Basic, 3=Intermediate, 4=Advanced, 5=Expert")


class EmployeeSkillResponse(BaseModel):
    skill_id: int
    skill_name: str
    skill_category: str
    proficiency_level: int
    assessed_at: datetime
