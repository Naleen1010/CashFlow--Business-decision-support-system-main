# In a new service file, e.g., debug_service.py
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
from app.models.base import PyObjectId
from typing import Optional, Dict

async def debug_check_business(business_id: str, db=None) -> Optional[Dict]:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    try:
        # Convert to PyObjectId
        business_id_obj = PyObjectId(business_id)
        
        # Find the business
        business = await db.businesses.find_one({"_id": business_id_obj})
        
        if not business:
            print(f"No business found with ID: {business_id}")
            return None
        
        # Print out business details
        print("Business Found:")
        print(f"ID: {business['_id']}")
        print(f"Name: {business.get('name', 'N/A')}")
        print(f"Email: {business.get('email', 'N/A')}")
        
        return business
    except Exception as e:
        print(f"Error checking business: {e}")
        return None