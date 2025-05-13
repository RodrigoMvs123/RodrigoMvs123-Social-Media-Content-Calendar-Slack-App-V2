from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models import Post, User, PlatformType, ContentStatus, MediaAttachment
from pydantic import BaseModel
from .auth import oauth2_scheme, get_current_user

router = APIRouter()

class PostBase(BaseModel):
    content: str
    platform: PlatformType
    scheduled_time: Optional[datetime] = None

class PostCreate(PostBase):
    pass

class PostUpdate(PostBase):
    status: Optional[ContentStatus] = None

class PostResponse(PostBase):
    id: int
    status: ContentStatus
    created_at: datetime
    updated_at: Optional[datetime]
    author_id: int

    class Config:
        from_attributes = True

@router.post("/", response_model=PostResponse)
async def create_post(
    post: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_post = Post(
        **post.dict(),
        author_id=current_user.id,
        status=ContentStatus.DRAFT
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@router.get("/", response_model=List[PostResponse])
async def get_posts(
    skip: int = 0,
    limit: int = 100,
    platform: Optional[PlatformType] = None,
    status: Optional[ContentStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Post).filter(Post.author_id == current_user.id)
    
    if platform:
        query = query.filter(Post.platform == platform)
    if status:
        query = query.filter(Post.status == status)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(Post).filter(
        Post.id == post_id,
        Post.author_id == current_user.id
    ).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: int,
    post_update: PostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_post = db.query(Post).filter(
        Post.id == post_id,
        Post.author_id == current_user.id
    ).first()
    
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    for key, value in post_update.dict(exclude_unset=True).items():
        setattr(db_post, key, value)
    
    db.commit()
    db.refresh(db_post)
    return db_post

@router.delete("/{post_id}")
async def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(Post).filter(
        Post.id == post_id,
        Post.author_id == current_user.id
    ).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully"} 