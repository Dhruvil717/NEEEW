from sqlalchemy import Column, Integer, Text, ForeignKey, JSON, String
from sqlalchemy.orm import relationship
from .base import Base
from .chat import Chat
from datetime import datetime

class Conversation(Base):
    __tablename__ = 'conversations'
    
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey('chats.id'))
    user_message = Column(Text)
    bot_response = Column(Text)
    structured_data = Column(JSON)
    created_at = Column(String(20), default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    
    chat = relationship("Chat", back_populates="conversations")