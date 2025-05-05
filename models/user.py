from sqlalchemy import Column, Integer, String
from .base import Base

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50))
    last_name = Column(String(50))
    dob = Column(String(10))
    country = Column(String(50))
    country_code = Column(String(10))
    phone_number = Column(String(20), unique=True, index=True)
    gender = Column(String(10))
    email = Column(String(100), unique=True, index=True)
    password = Column(String(255))
    profile_image = Column(String(255))