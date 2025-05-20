from pydantic import Field, BaseModel
from typing import Optional
from enum import Enum
from .base import PyObjectId, BaseDBModel

class UserRole(str, Enum):
    ADMIN = "admin"
    REGULAR = "regular"

class UserModel(BaseDBModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    business_id: PyObjectId
    username: str
    email: str
    role: UserRole
    hashed_password: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "business_id": "60d5ecf21f86d67b2c1b3b1e",
                "username": "johndoe",
                "email": "john@example.com",
                "role": "regular",
                "hashed_password": "hashedpassword"
            }
        }
    }

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: UserRole

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None

# Password management models
class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class PasswordReset(BaseModel):
    password: str

class UserInDB(UserModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    business_id: PyObjectId
    hashed_password: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "business_id": "507f1f77bcf86cd799439012",
                "username": "johndoe",
                "email": "john@example.com",
                "role": "regular",
                "hashed_password": "hashedpassword"
            }
        }
    }