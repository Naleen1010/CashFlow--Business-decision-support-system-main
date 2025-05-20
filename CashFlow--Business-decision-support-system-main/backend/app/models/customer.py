from pydantic import Field, BaseModel
from typing import Optional, List
from .base import PyObjectId, BaseDBModel

class CustomerModel(BaseDBModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    business_id: PyObjectId
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    discount_eligibility: bool = False
    purchase_history: List[PyObjectId] = []

    model_config = {
        "json_schema_extra": {
            "example": {
                "business_id": "60d5ecf21f86d67b2c1b3b1e",
                "name": "John Doe",
                "email": "john@example.com",
                "phone": "+1234567890",
                "address": "123 Main St, City, Country",
                "discount_eligibility": True,
                "purchase_history": ["60d5ecf21f86d67b2c1b3b21", "60d5ecf21f86d67b2c1b3b22"]
            }
        }
    }

class CustomerCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    discount_eligibility: bool = False

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    discount_eligibility: Optional[bool] = None