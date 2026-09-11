from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class ChatSource(BaseModel):
    filename: str
    chunk_index: int


class ChatResponse(BaseModel):
    answer: str
    sources: list[ChatSource]


class ChatHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    role: str
    message: str
    created_at: datetime


class IngestMaterialRequest(BaseModel):
    filename: str = Field(min_length=1, max_length=255)


class IngestMaterialResponse(BaseModel):
    filename: str
    chunks_stored: int
