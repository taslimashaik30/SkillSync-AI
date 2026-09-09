from collections.abc import Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select, text
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..models import User
from .security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_error = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise credentials_error
        user = db.scalar(select(User).where(User.id == int(user_id)))
    except (ValueError, TypeError):
        raise credentials_error
    if user is None:
        raise credentials_error
    return user


def require_role(*role_names: str) -> Callable:
    def role_checker(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> User:
        role_name = db.scalar(text("SELECT name FROM roles WHERE id = :role_id"), {"role_id": current_user.role_id})
        if role_name not in role_names:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user
    return role_checker
