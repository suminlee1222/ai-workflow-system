import os

from fastapi import FastAPI
from app.api.tasks import router as task_router
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine
from app.db.base import Base  # 모든 model import 모아둔 Base

app = FastAPI(title="AI Workflow System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(task_router, prefix="/api/tasks")

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

@app.get("/health")
def health():
    return {"status": "ok"}



