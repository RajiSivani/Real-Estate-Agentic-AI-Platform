"""
HomePort FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

# Import routers
from app.routers import listings, offers, buyer, notifications

# Create FastAPI app
app = FastAPI(
    title="HomePort API",
    description="AI-powered real estate workflow platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(listings.router)
app.include_router(offers.router)
app.include_router(buyer.router)
app.include_router(notifications.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to HomePort API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
