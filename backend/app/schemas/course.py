from pydantic import BaseModel, ConfigDict


class CourseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    provider: str
    source: str
    category: str | None
    difficulty: str | None
    duration_minutes: int | None
    url: str | None


class LearningPathItem(BaseModel):
    course_id: int
    title: str
    description: str | None
    category: str | None
    level: str | None
    duration: str | None
    progress: float
    status: str
    skills: list[str]


class LearningPathResponse(BaseModel):
    path: list[LearningPathItem]
