from pydantic import Field, BaseModel, field_validator
from typing import List, Optional
from datetime import datetime
from .base import PyObjectId, BaseDBModel
from enum import Enum

class PaymentMethod(str, Enum):
    CASH = "cash"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    BANK_TRANSFER = "bank_transfer"

# Input model for sale items (only id and quantity required)
class SaleItemCreate(BaseModel):
    product_id: str  # Accept string ID
    quantity: int

    @field_validator('product_id')
    def validate_object_id(cls, v):
        try:
            PyObjectId(v)  # Validate the format
            return v
        except Exception:
            raise ValueError("Invalid ObjectId format")

# Full model for sale items (includes calculated fields)
class SaleItemModel(BaseModel):
    product_id: PyObjectId
    category_id: PyObjectId  # Add category reference
    quantity: int
    unit_price: float
    subtotal: float
    product_name: str
    category_name: str  # Add category name for reference

class SaleStatus(str, Enum):
    COMPLETED = "completed"
    REFUNDED = "refunded"
    PARTIAL_REFUNDED = "partial_refunded"
    PENDING = "pending"
    CANCELLED = "cancelled"

class SaleModel(BaseDBModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    business_id: PyObjectId
    customer_id: Optional[PyObjectId] = None
    items: List[SaleItemModel]
    subtotal: float
    total_amount: float
    tax: float
    discount: float
    payment_method: PaymentMethod
    status: SaleStatus = SaleStatus.COMPLETED
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_refunded: bool = False
    order_id: Optional[PyObjectId] = None
    notes: Optional[str] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "customer_id": "60d5ecf21f86d67b2c1b3b1f",
                "items": [
                    {
                        "product_id": "60d5ecf21f86d67b2c1b3b20",
                        "quantity": 2,
                        "unit_price": 19.99,
                        "subtotal": 39.98,
                        "product_name": "Sample Product"
                    }
                ],
                "subtotal": 39.98,
                "total_amount": 43.18,
                "tax": 3.20,
                "discount": 0,
                "payment_method": "credit_card",
                "notes": "Regular sale"
            }
        }
    }

class SaleCreate(BaseModel):
    customer_id: Optional[PyObjectId] = None
    items: List[SaleItemCreate]  # Only need product_id and quantity
    tax_percentage: float = Field(default=0, ge=0, le=100)
    discount_percentage: float = Field(default=0, ge=0, le=100)
    payment_method: PaymentMethod
    notes: Optional[str] = None

class RefundReason(str, Enum):
    CUSTOMER_DISSATISFACTION = "customer_dissatisfaction"
    DEFECTIVE_PRODUCT = "defective_product"
    WRONG_ITEM = "wrong_item"
    CHANGED_MIND = "changed_mind"
    OTHER = "other"

class RefundItemCreate(BaseModel):
    product_id: str  # Accept string ID
    quantity: int

    @field_validator('product_id')
    def validate_object_id(cls, v):
        try:
            PyObjectId(v)  # Validate the format
            return v
        except Exception:
            raise ValueError("Invalid ObjectId format")

class RefundModel(BaseDBModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    business_id: PyObjectId
    sale_id: PyObjectId
    items: List[SaleItemModel]  # Items being refunded with their original prices
    reason: RefundReason
    subtotal: float
    tax_refund: float
    total_refund: float
    payment_method: PaymentMethod
    notes: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    processed_by: PyObjectId

    model_config = {
        "json_schema_extra": {
            "example": {
                "items": [{
                    "product_id": "60d5ecf21f86d67b2c1b3b20",
                    "quantity": 1,
                    "unit_price": 19.99,
                    "subtotal": 19.99,
                    "product_name": "Sample Product"
                }],
                "reason": "defective_product",
                "subtotal": 19.99,
                "tax_refund": 1.60,
                "total_refund": 21.59,
                "payment_method": "credit_card",
                "notes": "Defective item return"
            }
        }
    }

class RefundCreate(BaseModel):
    items: List[RefundItemCreate]  # Only need product_id and quantity to refund
    reason: RefundReason
    payment_method: PaymentMethod
    notes: Optional[str] = None

class OrderItemModel(BaseModel):
    product_id: PyObjectId
    category_id: PyObjectId  # Add category reference
    quantity: int
    unit_price: float
    subtotal: float
    product_name: str
    category_name: str  # Add category name for reference