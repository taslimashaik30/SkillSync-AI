from pydantic import BaseModel, EmailStr, Field, field_validator

from .user import UserResponse


class RegistrationRequest(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    employee_code: str = Field(min_length=1, max_length=50)
    department: str | None = Field(default=None, max_length=150)
    designation: str | None = Field(default=None, max_length=150)

    @field_validator("name", "employee_code", "department", "designation")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("must not be blank")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
