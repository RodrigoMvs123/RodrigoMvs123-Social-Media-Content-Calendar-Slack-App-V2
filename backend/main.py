from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session
from typing import List
import os
from dotenv import load_dotenv
from .routers import auth, posts, ai
from .database import engine, Base
from .services.slack_service import slack_service
from .middleware import error_handling_middleware, APIErrorHandler

load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Social Media Content Calendar API",
    description="API for managing social media content with AI generation and Slack integration",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add error handling middleware
app.middleware("http")(error_handling_middleware)

# Add exception handlers
app.add_exception_handler(RequestValidationError, APIErrorHandler.validation_exception_handler)
app.add_exception_handler(HTTPException, APIErrorHandler.http_exception_handler)
app.add_exception_handler(Exception, APIErrorHandler.generic_exception_handler)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(posts.router, prefix="/api/posts", tags=["posts"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])

@app.get("/")
async def root():
    return {
        "message": "Social Media Content Calendar API",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected" if engine else "disconnected"
    }

@app.on_event("startup")
async def startup_event():
    # Verify environment variables
    required_vars = [
        "DATABASE_URL",
        "OPENAI_API_KEY",
        "SLACK_BOT_TOKEN",
        "SLACK_CHANNEL_ID"
    ]
    
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        raise Exception(f"Missing required environment variables: {', '.join(missing_vars)}")
        
    # Test Slack connection
    try:
        await slack_service.send_post_notification(
            {"platform": "test", "status": "test", "content": "API Started"},
            action="test"
        )
    except Exception as e:
        print(f"Warning: Could not send Slack notification: {str(e)}") 