from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.inventory import InventoryItemCreate, InventoryItemUpdate, InventoryItemModel
from app.models.base import PyObjectId
from config import settings
from typing import Optional, List

async def check_category_exists(db, business_id: str, category_id: str) -> bool:
    try:
        # Simple direct query
        category = await db.categories.find_one({
            "_id": PyObjectId(category_id),
            "business_id": PyObjectId(business_id)
        })
        return category is not None
    except Exception:
        return False

async def create_inventory_item(business_id: str, item: InventoryItemCreate, db=None) -> InventoryItemModel:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    try:
        # First check if category exists with direct query
        if not await check_category_exists(db, business_id, str(item.category_id)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category not found"
            )
        
        # Check for duplicate name
        existing = await db.inventory.find_one({
            "business_id": PyObjectId(business_id),
            "name": item.name.strip().lower()
        })
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Item with name '{item.name}' already exists"
            )
        
        # Check for duplicate SKU
        if item.sku:
            sku_exists = await db.inventory.find_one({
                "business_id": PyObjectId(business_id),
                "sku": item.sku.strip().upper()
            })
            if sku_exists:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Item with SKU '{item.sku}' already exists"
                )
        
        # Check for duplicate barcode if provided
        if item.barcode:
            barcode_exists = await db.inventory.find_one({
                "business_id": PyObjectId(business_id),
                "barcode": item.barcode.strip()
            })
            if barcode_exists:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Item with barcode '{item.barcode}' already exists"
                )
        
        # Create new item
        new_item = {
            "_id": PyObjectId(),
            "business_id": PyObjectId(business_id),
            "category_id": PyObjectId(str(item.category_id)),  # Convert to string first
            "name": item.name.strip().lower(),
            "description": item.description.strip() if item.description else None,
            "price": float(item.price),
            "quantity": int(item.quantity),
            "sku": item.sku.strip().upper() if item.sku else None,
            "barcode": item.barcode.strip() if item.barcode else None  # Process barcode
        }
        
        # Insert into database
        result = await db.inventory.insert_one(new_item)
        
        # Get category name for response
        category = await db.categories.find_one({"_id": PyObjectId(str(item.category_id))})
        category_name = category["name"] if category else None
        
        # Return complete item with category name
        created_item = await get_inventory_item(business_id, str(result.inserted_id), db)
        if not created_item:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create item"
            )
            
        return created_item
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

async def get_inventory_items(business_id: str, db=None) -> List[InventoryItemModel]:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    try:
        cursor = db.inventory.find({"business_id": PyObjectId(business_id)})
        items = await cursor.to_list(length=None)
        
        result = []
        for item in items:
            # Get category name
            category = await db.categories.find_one({"_id": item["category_id"]})
            category_name = category["name"] if category else None
            
            result.append(InventoryItemModel(
                id=item["_id"],
                business_id=item["business_id"],
                category_id=item["category_id"],
                name=item["name"].title(),
                description=item.get("description"),
                price=item["price"],
                quantity=item["quantity"],
                sku=item.get("sku"),
                barcode=item.get("barcode"),  # Include barcode in result
                category_name=category_name
            ))
            
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

async def get_inventory_item(business_id: str, item_id: str, db=None) -> Optional[InventoryItemModel]:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    try:
        item = await db.inventory.find_one({
            "_id": PyObjectId(item_id),
            "business_id": PyObjectId(business_id)
        })
        
        if not item:
            return None
            
        # Get category name
        category = await db.categories.find_one({"_id": item["category_id"]})
        category_name = category["name"] if category else None
        
        return InventoryItemModel(
            id=item["_id"],
            business_id=item["business_id"],
            category_id=item["category_id"],
            name=item["name"].title(),
            description=item.get("description"),
            price=item["price"],
            quantity=item["quantity"],
            sku=item.get("sku"),
            barcode=item.get("barcode"),  # Include barcode in result
            category_name=category_name
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

async def update_inventory_item(business_id: str, item_id: str, item: InventoryItemUpdate, db=None) -> Optional[InventoryItemModel]:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    try:
        # Check if item exists
        existing_item = await get_inventory_item(business_id, item_id, db)
        if not existing_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )
            
        # If category is being updated, validate it exists
        if item.category_id and not await check_category_exists(db, business_id, str(item.category_id)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category not found"
            )
            
        # Build update data
        update_data = {}
        
        if item.name is not None:
            # Check for duplicate name
            name_exists = await db.inventory.find_one({
                "business_id": PyObjectId(business_id),
                "name": item.name.strip().lower(),
                "_id": {"$ne": PyObjectId(item_id)}
            })
            if name_exists:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Item with name '{item.name}' already exists"
                )
            update_data["name"] = item.name.strip().lower()
            
        if item.description is not None:
            update_data["description"] = item.description.strip() if item.description else None
        if item.price is not None:
            update_data["price"] = float(item.price)
        if item.quantity is not None:
            update_data["quantity"] = int(item.quantity)
        if item.sku is not None:
            sku_exists = await db.inventory.find_one({
                "business_id": PyObjectId(business_id),
                "sku": item.sku.strip().upper(),
                "_id": {"$ne": PyObjectId(item_id)}
            })
            if sku_exists:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Item with SKU '{item.sku}' already exists"
                )
            update_data["sku"] = item.sku.strip().upper() if item.sku else None
        
        if item.barcode is not None:
            # Check for duplicate barcode
            if item.barcode:
                barcode_exists = await db.inventory.find_one({
                    "business_id": PyObjectId(business_id),
                    "barcode": item.barcode.strip(),
                    "_id": {"$ne": PyObjectId(item_id)}
                })
                if barcode_exists:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Item with barcode '{item.barcode}' already exists"
                    )
            update_data["barcode"] = item.barcode.strip() if item.barcode else None
            
        if item.category_id is not None:
            update_data["category_id"] = PyObjectId(str(item.category_id))
            
        if update_data:
            result = await db.inventory.update_one(
                {
                    "_id": PyObjectId(item_id),
                    "business_id": PyObjectId(business_id)
                },
                {"$set": update_data}
            )
            
            # Don't check modified_count, as it might be 0 if values are the same
            # Instead, check if the update was acknowledged
            if not result.acknowledged:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update item"
                )
                
        return await get_inventory_item(business_id, item_id, db)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    
    
async def delete_inventory_item(business_id: str, item_id: str, db=None) -> bool:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    try:
        # Check if item exists
        item = await get_inventory_item(business_id, item_id, db)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )
            
        # Check if item is used in sales
        sale_exists = await db.sales.find_one({
            "business_id": PyObjectId(business_id),
            "items.product_id": PyObjectId(item_id)
        })
        if sale_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete item that has been used in sales"
            )
            
        # Delete the item
        result = await db.inventory.delete_one({
            "_id": PyObjectId(item_id),
            "business_id": PyObjectId(business_id)
        })
        
        return result.deleted_count > 0
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    

async def get_inventory_item_by_barcode(business_id: str, barcode: str, db=None) -> Optional[InventoryItemModel]:
    """Get inventory item by barcode"""
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    try:
        print(f"Looking up barcode: {barcode} for business: {business_id}")
        item = await db.inventory.find_one({
            "business_id": PyObjectId(business_id),
            "barcode": barcode.strip()
        })
        
        if not item:
            print(f"No item found with barcode: {barcode}")
            return None
            
        # Get category name
        category = await db.categories.find_one({"_id": item["category_id"]})
        category_name = category["name"] if category else None
        
        return InventoryItemModel(
            id=item["_id"],
            business_id=item["business_id"],
            category_id=item["category_id"],
            name=item["name"].title(),
            description=item.get("description"),
            price=item["price"],
            quantity=item["quantity"],
            sku=item.get("sku"),
            barcode=item.get("barcode"),
            category_name=category_name
        )
        
    except Exception as e:
        print(f"Error finding inventory item by barcode: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )