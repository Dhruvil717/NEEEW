from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base
from .user import User
from .epic import Epic

class Story(Base):
    __tablename__ = 'stories'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    epic_id = Column(Integer, ForeignKey('epic.id'))
    title = Column(String(255), index=True)
    description = Column(Text)
    estimation = Column(Integer)
    
    tasks = relationship("Task", back_populates="story", cascade="all, delete-orphan")
    epic = relationship("Epic", back_populates="stories")
    user = relationship("User")