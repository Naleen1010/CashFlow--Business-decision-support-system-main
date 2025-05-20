from app.models.business import BusinessCreate, BusinessModel
from app.models.settings import SettingsModel
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
from app.models.base import PyObjectId
from typing import Optional
import logging

logger = logging.getLogger(__name__)

async def create_business(business: BusinessCreate, db=None) -> str:
    """
    Create a new business and its initial settings with detailed logging.
    """
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    logger.info(f"Creating new business: {business.name!r}")
    logger.info(f"Business details: email={business.email!r}, address={business.address!r}, phone={business.phone!r}")
    
    # Create new business ID
    business_id = PyObjectId()
    logger.info(f"Generated new business ID: {business_id!r}")
    
    # Create business model
    business_in_db = BusinessModel(
        id=business_id,
        name=business.name,
        email=business.email,
        address=business.address,
        phone=business.phone
    )
    
    # Convert to dict for insertion
    business_dict = business_in_db.model_dump(by_alias=True)
    logger.info(f"Business document to insert: {business_dict}")
    
    # Insert business
    result = await db.businesses.insert_one(business_dict)
    inserted_id = result.inserted_id
    logger.info(f"Inserted business with ID: {inserted_id!r}")
    
    # Verify business was inserted
    inserted_business = await db.businesses.find_one({"_id": inserted_id})
    if not inserted_business:
        logger.error(f"Failed to find inserted business: {inserted_id!r}")
    else:
        logger.info(f"Verified business in DB: {inserted_business}")
    
    # Create settings ID
    settings_id = PyObjectId()
    logger.info(f"Generated new settings ID: {settings_id!r}")
    
    # Create settings with the same business ID
    settings_model = SettingsModel(
        id=settings_id,
        business_id=business_id,  # Use the same business ID
        
        # Use business details
        business_name=business.name,
        business_address=business.address,
        contact_number=business.phone,
        
        # Default values for other fields
        invoice_prefix="INV",
        invoice_footer_text="Thank you for your business!",
        include_company_logo=True,
        logo_url=None,
        default_tax_rate=0,
        low_stock_alerts=True,
        low_stock_threshold=10,
        order_notifications=True,
        email_notifications=True,
        sms_notifications=False,
        default_printer=None,
        terms_and_conditions="Standard business terms apply."
    )
    
    # Convert to dict for insertion
    settings_dict = settings_model.model_dump(by_alias=True)
    logger.info(f"Settings document to insert: {settings_dict}")
    
    # Insert settings
    settings_result = await db.settings.insert_one(settings_dict)
    settings_inserted_id = settings_result.inserted_id
    logger.info(f"Inserted settings with ID: {settings_inserted_id!r}")
    
    # Verify settings were inserted
    inserted_settings = await db.settings.find_one({"_id": settings_inserted_id})
    if not inserted_settings:
        logger.error(f"Failed to find inserted settings: {settings_inserted_id!r}")
    else:
        logger.info(f"Verified settings in DB: {inserted_settings}")
        
    # Double verify by business ID
    business_settings = await db.settings.find_one({"business_id": business_id})
    if not business_settings:
        logger.error(f"Failed to find settings by business ID: {business_id!r}")
    else:
        logger.info(f"Verified settings by business ID: {business_settings}")

    return str(business_id)