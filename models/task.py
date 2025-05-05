from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base
from .user import User
from .story import Story

class Task(Base):
    __tablename__ = 'tasks'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    story_id = Column(Integer, ForeignKey('stories.id'))
    title = Column(String(255), index=True)
    description = Column(Text)
    estimation = Column(Integer)
    
    story = relationship("Story", back_populates="tasks")
    user = relationship("User")