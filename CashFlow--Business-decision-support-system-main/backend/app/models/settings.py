from pydantic import Field, BaseModel
from typing import Optional
from .base import PyObjectId, BaseDBModel

class DisplaySettings(BaseModel):
    """Display settings for the application UI"""
    displaySize: str = Field(default="100", description="Scale of the UI (100, 90, or 80 percent)")

class SettingsModel(BaseDBModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    business_id: PyObjectId
    
    # Business Settings
    business_name: str
    business_address: Optional[str] = None
    contact_number: Optional[str] = None
    
    # Invoice Settings
    invoice_prefix: Optional[str] = None
    invoice_footer_text: Optional[str] = None
    include_company_logo: bool = True
    logo_url: Optional[str] = None
    
    # Tax Settings
    default_tax_rate: float = Field(default=0, ge=0, le=100)  # Simple percentage
    
    # Notification Settings
    low_stock_alerts: bool = True
    low_stock_threshold: int = Field(default=10, ge=0)
    order_notifications: bool = True
    email_notifications: bool = True
    sms_notifications: bool = False
    
    # General Settings
    default_printer: Optional[str] = None
    terms_and_conditions: Optional[str] = None
    
    # Display Settings
    display: Optional[DisplaySettings] = Field(default_factory=lambda: DisplaySettings(displaySize="100"))

    model_config = {
        "json_schema_extra": {
            "example": {
                "business_name": "Acme Inc.",
                "business_address": "123 Main St, City, Country",
                "contact_number": "+1234567890",
                "invoice_prefix": "INV",
                "invoice_footer_text": "Thank you for your business!",
                "include_company_logo": True,
                "logo_url": "https://example.com/logo.png",
                "default_tax_rate": 10.0,
                "low_stock_alerts": True,
                "low_stock_threshold": 10,
                "order_notifications": True,
                "email_notifications": True,
                "sms_notifications": False,
                "default_printer": "Main Office Printer",
                "terms_and_conditions": "Terms and conditions apply.",
                "display": {
                    "displaySize": "100"
                }
            }
        }
    }

class SettingsUpdate(BaseModel):
    # Business Settings
    business_name: Optional[str] = None
    business_address: Optional[str] = None
    contact_number: Optional[str] = None
    
    # Invoice Settings
    invoice_prefix: Optional[str] = None
    invoice_footer_text: Optional[str] = None
    include_company_logo: Optional[bool] = None
    logo_url: Optional[str] = None
    
    # Tax Settings
    default_tax_rate: Optional[float] = Field(default=None, ge=0, le=100)
    
    # Notification Settings
    low_stock_alerts: Optional[bool] = None
    low_stock_threshold: Optional[int] = Field(default=None, ge=0)
    order_notifications: Optional[bool] = None
    email_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None
    
    # General Settings
    default_printer: Optional[str] = None
    terms_and_conditions: Optional[str] = None
    
    # Display Settings
    display: Optional[DisplaySettings] = None