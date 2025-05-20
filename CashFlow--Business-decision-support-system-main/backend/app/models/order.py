from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime
from .base import PyObjectId, BaseDBModel
from enum import Enum

class OrderStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class OrderItemCreate(BaseModel):
    product_id: str  # Accept string ID
    quantity: int

    @field_validator('product_id')
    def validate_object_id(cls, v):
        try:
            PyObjectId(v)  # Validate the format
            return v
        except Exception:
            raise ValueError("Invalid ObjectId format")

class OrderItemModel(BaseModel):
    product_id: PyObjectId
    category_id: PyObjectId
    quantity: int
    unit_price: float
    subtotal: float
    product_name: str
    category_name: str

class OrderCreate(BaseModel):
    customer_id: PyObjectId
    items: List[OrderItemCreate]
    delivery_date: datetime
    tax_percentage: float = Field(default=0, ge=0, le=100)
    discount_percentage: float = Field(default=0, ge=0, le=100)

class OrderModel(BaseDBModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    business_id: PyObjectId
    customer_id: PyObjectId
    items: List[OrderItemModel]
    subtotal: float
    tax_amount: float
    discount_amount: float
    total_amount: float
    status: OrderStatus = OrderStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    delivery_date: datetime
    completed_at: Optional[datetime] = None
    sale_id: Optional[PyObjectId] = None  # Reference to the sale when order is completed

    model_config = {
        "json_schema_extra": {
            "example": {
                "customer_id": "60d5ecf21f86d67b2c1b3b1f",
                "items": [
                    {
                        "product_id": "60d5ecf21f86d67b2c1b3b20",
                        "category_id": "60d5ecf21f86d67b2c1b3b21",
                        "quantity": 2,
                        "unit_price": 19.99,
                        "subtotal": 39.98,
                        "product_name": "Sample Product",
                        "category_name": "Electronics"
                    }
                ],
                "subtotal": 39.98,
                "tax_amount": 3.20,
                "discount_amount": 0,
                "total_amount": 43.18,
                "status": "pending",
                "delivery_date": "2024-02-20T10:00:00Z"
            }
        }
    }