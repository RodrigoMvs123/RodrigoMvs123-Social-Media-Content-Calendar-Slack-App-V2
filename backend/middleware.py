from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from typing import Callable
import logging
import time
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)

logger = logging.getLogger(__name__)

async def error_handling_middleware(request: Request, call_next: Callable):
    try:
        start_time = time.time()
        
        # Log request
        logger.info(f"Request started: {request.method} {request.url}")
        
        response = await call_next(request)
        
        # Log response time
        process_time = time.time() - start_time
        logger.info(f"Request completed: {request.method} {request.url} - Took {process_time:.2f}s")
        
        return response
        
    except HTTPException as exc:
        logger.error(f"HTTP error occurred: {exc.detail}")
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )
    except Exception as exc:
        logger.error(f"Unexpected error occurred: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )

class APIErrorHandler:
    """Custom exception handler for API errors"""
    
    @staticmethod
    async def validation_exception_handler(request: Request, exc: HTTPException):
        logger.error(f"Validation error: {exc.detail}")
        return JSONResponse(
            status_code=422,
            content={
                "detail": "Validation error",
                "errors": exc.detail
            }
        )
    
    @staticmethod
    async def http_exception_handler(request: Request, exc: HTTPException):
        logger.error(f"HTTP error {exc.status_code}: {exc.detail}")
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )
    
    @staticmethod
    async def generic_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        ) 