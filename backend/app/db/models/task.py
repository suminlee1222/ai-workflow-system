from sqlalchemy import Column, Integer, String, Text
from app.db.session import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, nullable=False)
    title = Column(Text, nullable=False)
    description = Column(Text)
    status = Column(String(50), nullable=False)
