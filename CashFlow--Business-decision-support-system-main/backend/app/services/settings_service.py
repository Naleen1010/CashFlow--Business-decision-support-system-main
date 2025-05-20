# app/services/settings_service.py

import logging
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
from app.models.settings import SettingsUpdate, SettingsModel, DisplaySettings
from app.models.base import PyObjectId
from bson import ObjectId
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)

async def debug_list_all_settings(db):
    """Debug function to list all settings in the database"""
    all_settings = await db.settings.find().to_list(length=None)
    logger.info(f"Total settings in database: {len(all_settings)}")
    
    for idx, s in enumerate(all_settings):
        logger.info(f"Settings #{idx+1}:")
        logger.info(f"  _id: {s.get('_id')}")
        logger.info(f"  business_id: {s.get('business_id')}")
        logger.info(f"  business_name: {s.get('business_name')}")
        # Log display settings if they exist
        if 'display' in s:
            logger.info(f"  display: {s.get('display')}")
    
    return all_settings

async def get_settings(business_id: str, db=None) -> SettingsModel:
    """
    Get existing settings for a business with detailed debugging.
    """
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    try:
        # Log input business_id exactly as received
        logger.info(f"Looking for settings with raw business_id: {business_id!r}")
        logger.info(f"Business ID type: {type(business_id)}")
        
        # Convert string ID to PyObjectId
        try:
            business_id_obj = PyObjectId(business_id)
            logger.info(f"Converted to PyObjectId: {business_id_obj!r}")
        except Exception as e:
            logger.error(f"Error converting business_id to PyObjectId: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid business ID format: {business_id}"
            )
        
        # Also try direct ObjectId conversion
        try:
            direct_obj_id = ObjectId(business_id)
            logger.info(f"Direct ObjectId conversion: {direct_obj_id!r}")
        except Exception as e:
            logger.error(f"Error direct converting to ObjectId: {str(e)}")
        
        # Debug: List all settings in the database
        await debug_list_all_settings(db)
        
        # Try to find with PyObjectId
        logger.info(f"Querying with business_id as PyObjectId: {business_id_obj!r}")
        settings_doc = await db.settings.find_one({"business_id": business_id_obj})
        
        if not settings_doc:
            # Try with string ID
            logger.info(f"Not found with PyObjectId, trying with string: {business_id}")
            settings_doc = await db.settings.find_one({"business_id": business_id})
        
        if not settings_doc:
            # Try with direct ObjectId  
            logger.info(f"Not found with string, trying with direct ObjectId: {direct_obj_id!r}")
            settings_doc = await db.settings.find_one({"business_id": direct_obj_id})
            
        if not settings_doc:
            # List all businesses for debugging
            businesses = await db.businesses.find().to_list(length=None)
            logger.info(f"Existing businesses in DB: {len(businesses)}")
            for idx, b in enumerate(businesses):
                logger.info(f"Business #{idx+1}: _id={b.get('_id')}, name={b.get('name')}")
            
            logger.warning(f"No settings found for business ID: {business_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Settings not found for this business"
            )
        
        # Initialize display settings if not present
        if 'display' not in settings_doc or not settings_doc['display']:
            logger.info(f"Adding default display settings")
            settings_doc['display'] = {"displaySize": "100"}
            
            # Update the document with default display settings
            await db.settings.update_one(
                {"_id": settings_doc["_id"]},
                {"$set": {"display": {"displaySize": "100"}}}
            )
        
        # Log successful retrieval
        logger.info(f"Found settings: _id={settings_doc['_id']}, business_id={settings_doc['business_id']}")
        logger.info(f"Display settings: {settings_doc.get('display')}")
        
        # Return the settings
        return SettingsModel.model_validate(settings_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving settings: {str(e)}"
        )

async def update_settings(business_id: str, settings_update: SettingsUpdate, db=None) -> SettingsModel:
    """
    Update existing settings for a business.
    """
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    try:
        # Debug: Log input parameters
        logger.info(f"Updating settings for business ID: {business_id!r}")
        
        # First get existing settings (with detailed debug)
        existing_settings = await get_settings(business_id, db)
        settings_id = existing_settings.id
        
        logger.info(f"Found existing settings with ID: {settings_id!r}")
        
        # Extract only the fields that are set
        update_data = settings_update.model_dump(exclude_unset=True, exclude_none=True)
        
        if not update_data:
            logger.warning(f"No update data provided")
            return existing_settings
        
        # Handle display settings specifically if present
        if 'display' in update_data:
            logger.info(f"Display settings update: {update_data['display']}")
            
            # If we're updating display, make sure we validate displaySize
            if 'displaySize' in update_data['display']:
                display_size = update_data['display']['displaySize']
                if display_size not in ["100", "90", "80"]:
                    logger.warning(f"Invalid displaySize value: {display_size}, resetting to default")
                    update_data['display']['displaySize'] = "100"  # Default to 100% if invalid
        
        # Log update fields
        logger.info(f"Updating fields: {list(update_data.keys())}")
        
        # Update using the settings ID
        result = await db.settings.update_one(
            {"_id": settings_id},
            {"$set": update_data}
        )
        
        logger.info(f"Update result: matched={result.matched_count}, modified={result.modified_count}")
        
        # Get updated document
        updated_doc = await db.settings.find_one({"_id": settings_id})
        if not updated_doc:
            logger.error(f"Settings not found after update: {settings_id!r}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Settings not found after update"
            )
        
        return SettingsModel.model_validate(updated_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating settings: {str(e)}"
        )