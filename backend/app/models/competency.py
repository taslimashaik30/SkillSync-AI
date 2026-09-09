from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column
from ..database.base import Base
class Competency(Base):
    __tablename__ = "competencies"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150), unique=True)
    category: Mapped[str] = mapped_column(String(100), index=True)
    description: Mapped[str | None] = mapped_column(Text)
