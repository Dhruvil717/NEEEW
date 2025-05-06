from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base
from .user import User

class Epic(Base):
    __tablename__ = 'epic'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    title = Column(String(255), index=True)
    description = Column(Text)
    estimation = Column(Integer)
    
    stories = relationship("Story", back_populates="epic", cascade="all, delete-orphan")
    user = relationship("User")