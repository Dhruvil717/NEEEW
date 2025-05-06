from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base
from .user import User
from datetime import datetime

class Chat(Base):
    __tablename__ = 'chats'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    chat_name = Column(String(255))
    created_at = Column(String(20), default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    
    conversations = relationship("Conversation", back_populates="chat", cascade="all, delete-orphan")