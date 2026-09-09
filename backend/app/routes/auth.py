from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..core.dependencies import get_current_user
from ..core.security import create_access_token, hash_password, verify_password
from ..database.database import get_db
from ..models import Role, User
from ..schemas.auth import LoginRequest, RegistrationRequest, TokenResponse
from ..schemas.user import UserResponse

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegistrationRequest, db: Session = Depends(get_db)) -> User:
    email = str(payload.email).lower()
    if db.scalar(select(User.id).where(User.email == email)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered")
    if db.scalar(select(User.id).where(User.employee_code == payload.employee_code)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Employee code is already registered")
    default_role = db.scalar(select(Role).where(Role.name == "employee"))
    if default_role is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Default employee role is unavailable")
    user = User(name=payload.name, email=email, password_hash=hash_password(payload.password), role_id=default_role.id, employee_code=payload.employee_code, department=payload.department, designation=payload.designation)
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email or employee code is already registered")
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == str(payload.email).lower()))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password", headers={"WWW-Authenticate": "Bearer"})
    return TokenResponse(access_token=create_access_token({"sub": str(user.id)}), user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user
