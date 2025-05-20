from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.category import CategoryModel, CategoryCreate, CategoryUpdate
from app.models.base import PyObjectId
from config import settings
from typing import List

async def get_categories(business_id: str, db=None) -> List[CategoryModel]:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    # Simply find all categories for the business
    cursor = db.categories.find({"business_id": PyObjectId(business_id)})
    categories = await cursor.to_list(length=None)
    return [CategoryModel.model_validate(cat) for cat in categories]

async def create_category(business_id: str, category: CategoryCreate, db=None) -> CategoryModel:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    # Normalize the name for checking
    normalized_name = category.name.lower().strip()
    
    # Check if exists
    existing = await db.categories.find_one({
        "business_id": PyObjectId(business_id),
        "name_lower": normalized_name
    })
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{category.name}' already exists"
        )
    
    # Create new category
    new_category = {
        "_id": PyObjectId(),
        "business_id": PyObjectId(business_id),
        "name": category.name.strip(),
        "name_lower": normalized_name,
        "description": category.description.strip() if category.description else None,
        "is_active": category.is_active
    }
    
    # Insert and return
    await db.categories.insert_one(new_category)
    return CategoryModel.model_validate(new_category)

async def get_category(business_id: str, category_id: str, db=None) -> CategoryModel:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    category = await db.categories.find_one({
        "_id": PyObjectId(category_id),
        "business_id": PyObjectId(business_id)
    })
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
        
    return CategoryModel.model_validate(category)

async def update_category(business_id: str, category_id: str, category: CategoryUpdate, db=None) -> CategoryModel:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    # First check if category exists
    existing = await get_category(business_id, category_id, db)
    
    # If name is being updated, check for duplicates
    if category.name:
        normalized_name = category.name.lower().strip()
        if normalized_name != existing.name.lower():
            duplicate = await db.categories.find_one({
                "business_id": PyObjectId(business_id),
                "name_lower": normalized_name
            })
            if duplicate:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Category '{category.name}' already exists"
                )
    
    # Build update data
    update_data = {}
    if category.name:
        update_data["name"] = category.name.strip()
        update_data["name_lower"] = category.name.lower().strip()
    if category.description is not None:
        update_data["description"] = category.description.strip() if category.description else None
    if category.is_active is not None:
        update_data["is_active"] = category.is_active
    
    # Update if we have changes
    if update_data:
        await db.categories.update_one(
            {"_id": existing.id},
            {"$set": update_data}
        )
    
    return await get_category(business_id, category_id, db)