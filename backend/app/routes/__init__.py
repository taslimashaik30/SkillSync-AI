from .auth import router as auth_router
from .competencies import router as competencies_router
from .skills import router as skills_router
from .users import router as users_router

__all__ = ["auth_router", "competencies_router", "skills_router", "users_router"]
