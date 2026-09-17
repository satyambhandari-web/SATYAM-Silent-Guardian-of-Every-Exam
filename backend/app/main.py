from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import credentials
from app.db.database import engine
from app.models.base import Base
import app.models.domain

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SATYAM API",
    description="Backend API for SATYAM — Silent Guardian of Every Exam",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "ok",
        "service": "SATYAM API"
    }

app.include_router(credentials.router, prefix="/api/v1")
