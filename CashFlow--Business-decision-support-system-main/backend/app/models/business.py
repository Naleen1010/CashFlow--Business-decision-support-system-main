from pydantic import Field, BaseModel
from typing import Optional
from .base import PyObjectId, BaseDBModel

class BusinessModel(BaseDBModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    email: str
    address: Optional[str] = None
    phone: Optional[str] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Acme Inc.",
                "email": "info@acme.com",
                "address": "123 Main St, City, Country",
                "phone": "+1234567890"
            }
        }
    }

class BusinessCreate(BaseModel):
    name: str
    email: str
    password: str
    address: Optional[str] = None
    phone: Optional[str] = None

class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None