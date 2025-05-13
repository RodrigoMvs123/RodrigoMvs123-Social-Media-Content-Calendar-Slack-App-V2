from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class PlatformType(str, Enum):
    TWITTER = "twitter"
    LINKEDIN = "linkedin"
    INSTAGRAM = "instagram"
    FACEBOOK = "facebook"

class ContentStatus(str, Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    FAILED = "failed"

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True

class MediaAttachmentBase(BaseModel):
    url: str
    type: str

class MediaAttachmentCreate(MediaAttachmentBase):
    pass

class MediaAttachmentResponse(MediaAttachmentBase):
    id: int
    created_at: datetime
    post_id: int

    class Config:
        orm_mode = True

class PostAnalyticsResponse(BaseModel):
    id: int
    likes: int
    shares: int
    comments: int
    impressions: int
    updated_at: datetime
    post_id: int

    class Config:
        orm_mode = True

class PostBase(BaseModel):
    content: str
    platform: PlatformType
    scheduled_time: datetime

class PostCreate(PostBase):
    media_attachments: Optional[List[MediaAttachmentCreate]] = None

class PostUpdate(BaseModel):
    content: Optional[str] = None
    platform: Optional[PlatformType] = None
    scheduled_time: Optional[datetime] = None
    status: Optional[ContentStatus] = None

class PostResponse(PostBase):
    id: int
    status: ContentStatus
    published_time: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    author_id: int
    media_attachments: List[MediaAttachmentResponse]
    analytics: Optional[PostAnalyticsResponse]

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class AIContentRequest(BaseModel):
    platform: PlatformType
    topic: str
    tone: Optional[str] = "professional"
    length: Optional[int] = 280  # Default to Twitter length

class AIContentResponse(BaseModel):
    content: str
    suggestions: List[str] 