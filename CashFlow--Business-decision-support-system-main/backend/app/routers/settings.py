# app/routers/settings.py

from fastapi import APIRouter, Depends, HTTPException, status
from app.models.settings import SettingsUpdate, SettingsModel
from app.services.settings_service import get_settings, update_settings
from app.auth import get_current_admin_user
from app.models.user import UserInDB
from typing import Optional
import logging
from app.database import get_db  # Import the database dependency

# Create router without prefix
router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/{business_id}", response_model=Optional[SettingsModel])
async def read_settings(
    business_id: str, 
    current_user: UserInDB = Depends(get_current_admin_user),
    db = Depends(get_db)  # Add db dependency
):
    try:
        logger.info(f"Received request to get settings for business ID: {business_id}")
        
        # Verify that the business_id matches the user's business_id
        if str(current_user.business_id) != business_id:
            logger.error("Business ID mismatch")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Unauthorized access to business settings"
            )
        
        settings = await get_settings(business_id, db)
        logger.info(f"Settings retrieved successfully for business ID: {business_id}")
        return settings
            
    except HTTPException as he:
        logger.error(f"HTTP Error: {he.detail}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=str(e)
        )

@router.put("/{business_id}", response_model=SettingsModel)
async def update_business_settings(
    business_id: str,
    settings_update: SettingsUpdate,
    current_user: UserInDB = Depends(get_current_admin_user),
    db = Depends(get_db)  # Add db dependency
):
    try:
        logger.info(f"Received request to update settings for business ID: {business_id}")
        
        # Verify that the business_id matches the user's business_id
        if str(current_user.business_id) != business_id:
            logger.error("Business ID mismatch")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Unauthorized access to business settings"
            )
        
        # Validate tax rate
        if settings_update.default_tax_rate is not None:
            if settings_update.default_tax_rate < 0 or settings_update.default_tax_rate > 100:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Tax rate must be between 0 and 100"
                )
        
        # Validate low stock threshold
        if settings_update.low_stock_threshold is not None:
            if settings_update.low_stock_threshold < 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Low stock threshold cannot be negative"
                )
        
        updated_settings = await update_settings(business_id, settings_update, db)
        logger.info(f"Settings updated successfully for business ID: {business_id}")
        return updated_settings
            
    except HTTPException as he:
        logger.error(f"HTTP Error: {he.detail}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=str(e)
        )