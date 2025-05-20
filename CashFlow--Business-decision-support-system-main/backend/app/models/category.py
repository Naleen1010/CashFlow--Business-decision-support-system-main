from pydantic import Field, BaseModel, field_validator
from typing import Optional
from .base import PyObjectId, BaseDBModel

class CategoryModel(BaseDBModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    business_id: PyObjectId
    name: str
    description: Optional[str] = None
    is_active: bool = True

    @field_validator('name')
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Electronics",
                "description": "Electronic gadgets and devices",
                "is_active": True
            }
        }
        populate_by_name = True

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

    @field_validator('name')
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator('name')
    def validate_name(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError("Name cannot be empty")
            return v.strip()
        return v