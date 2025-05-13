from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base

class PlatformType(enum.Enum):
    TWITTER = "twitter"
    LINKEDIN = "linkedin"
    INSTAGRAM = "instagram"
    FACEBOOK = "facebook"

class ContentStatus(enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    FAILED = "failed"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    posts = relationship("Post", back_populates="author")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    platform = Column(Enum(PlatformType))
    status = Column(Enum(ContentStatus), default=ContentStatus.DRAFT)
    scheduled_time = Column(DateTime(timezone=True))
    published_time = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    author_id = Column(Integer, ForeignKey("users.id"))
    author = relationship("User", back_populates="posts")
    
    media_attachments = relationship("MediaAttachment", back_populates="post")
    analytics = relationship("PostAnalytics", back_populates="post")

class MediaAttachment(Base):
    __tablename__ = "media_attachments"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String)
    type = Column(String)  # image, video, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    post_id = Column(Integer, ForeignKey("posts.id"))
    post = relationship("Post", back_populates="media_attachments")

class PostAnalytics(Base):
    __tablename__ = "post_analytics"

    id = Column(Integer, primary_key=True, index=True)
    likes = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    impressions = Column(Integer, default=0)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    post_id = Column(Integer, ForeignKey("posts.id"))
    post = relationship("Post", back_populates="analytics") 