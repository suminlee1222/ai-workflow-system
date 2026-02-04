import os

from fastapi import FastAPI
from app.api.tasks import router as task_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Workflow System")

app.include_router(task_router, prefix="/api/tasks")

@app.get("/health")
def health():
    return {"status": "ok"}


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
