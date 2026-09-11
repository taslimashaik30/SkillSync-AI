from pydantic import BaseModel, ConfigDict, Field, field_validator


class UserResponse(BaseModel):
    """Safe representation of a user; deliberately excludes password_hash."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role_id: int
    employee_code: str
    department: str | None
    designation: str | None


class UserProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    department: str | None = Field(default=None, max_length=150)
    designation: str | None = Field(default=None, max_length=150)

    @field_validator("name", "department", "designation")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("must not be blank")
        return value


class UserStatsResponse(BaseModel):
    average_competency: float = Field(ge=0, le=100)
    courses_completed: int = Field(ge=0)
    courses_in_progress: int = Field(ge=0)
    hours_invested: float = Field(ge=0)
    assessments_taken: int = Field(ge=0)
