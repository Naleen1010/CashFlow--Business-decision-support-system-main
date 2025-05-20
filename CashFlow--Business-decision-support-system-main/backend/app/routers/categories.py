from fastapi import APIRouter, Depends, HTTPException, status
from app.models.category import CategoryModel, CategoryCreate, CategoryUpdate
from app.services.category_service import (
    get_categories,
    get_category,
    create_category,
    update_category
)
from app.auth import get_current_user, get_current_admin_user
from app.models.user import UserInDB
from typing import List
import logging
from app.database import get_db  # Import the database dependency

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get(
    "",  # CHANGED from "/categories" to "" (empty string)
    response_model=List[CategoryModel],
    status_code=status.HTTP_200_OK,
    response_description="List all categories"
)
async def list_categories(
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)  # Add db dependency
):
    """Get all categories for the current business"""
    logger.info(f"Listing categories for business: {current_user.business_id}")
    categories = await get_categories(str(current_user.business_id), db)
    logger.info(f"Found {len(categories)} categories")
    return categories

@router.post(
    "",  # CHANGED from "/categories" to "" (empty string)
    response_model=CategoryModel,
    status_code=status.HTTP_201_CREATED,
    response_description="Create a new category"
)
async def create_new_category(
    category: CategoryCreate,
    current_user: UserInDB = Depends(get_current_admin_user),
    db = Depends(get_db)  # Add db dependency
):
    """Create a new category (admin only)"""
    logger.info(f"Creating new category for business: {current_user.business_id}")
    return await create_category(str(current_user.business_id), category, db)

@router.get(
    "/{category_id}",  # CHANGED from "/categories/{category_id}" to "/{category_id}"
    response_model=CategoryModel,
    response_description="Get a specific category"
)
async def get_single_category(
    category_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)  # Add db dependency
):
    """Get a specific category by ID"""
    logger.info(f"Fetching category {category_id}")
    return await get_category(str(current_user.business_id), category_id, db)

@router.put(
    "/{category_id}",  # CHANGED from "/categories/{category_id}" to "/{category_id}"
    response_model=CategoryModel,
    response_description="Update a category"
)
async def update_existing_category(
    category_id: str,
    category: CategoryUpdate,
    current_user: UserInDB = Depends(get_current_admin_user),
    db = Depends(get_db)  # Add db dependency
):
    """Update an existing category (admin only)"""
    logger.info(f"Updating category {category_id}")
    return await update_category(str(current_user.business_id), category_id, category, db)