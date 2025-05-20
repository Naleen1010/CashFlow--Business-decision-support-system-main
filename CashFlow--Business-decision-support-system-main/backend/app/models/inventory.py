from pydantic import Field, BaseModel
from typing import Optional
from .base import PyObjectId, BaseDBModel

class InventoryItemModel(BaseDBModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    business_id: PyObjectId
    category_id: PyObjectId  # Add category reference
    name: str
    description: Optional[str] = None
    price: float
    quantity: int
    sku: Optional[str] = None
    barcode: Optional[str] = None  # New barcode field
    # Add category name for convenience in API responses
    category_name: Optional[str] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "business_id": "60d5ecf21f86d67b2c1b3b1e",
                "category_id": "60d5ecf21f86d67b2c1b3b1d",
                "name": "Product A",
                "description": "A high-quality product",
                "price": 19.99,
                "quantity": 100,
                "sku": "PROD-A-001",
                "barcode": "9781234567897",
                "category_name": "Electronics"
            }
        }
    }

class InventoryItemCreate(BaseModel):
    name: str
    category_id: PyObjectId  # Add category reference
    description: Optional[str] = None
    price: float
    quantity: int
    sku: Optional[str] = None
    barcode: Optional[str] = None  # New barcode field

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[PyObjectId] = None  # Add optional category update
    description: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None  # New barcode field