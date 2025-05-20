from fastapi import APIRouter, Depends, HTTPException, status
from app.models.inventory import InventoryItemCreate, InventoryItemUpdate, InventoryItemModel
from app.services.inventory_service import (
    get_inventory_items,
    get_inventory_item,
    get_inventory_item_by_barcode,
    create_inventory_item,
    update_inventory_item,
    delete_inventory_item
)
from app.auth import get_current_user, get_current_admin_user
from app.models.user import UserInDB
from typing import List, Optional
from app.database import get_db  # Import the database dependency

router = APIRouter()

@router.get("", response_model=List[InventoryItemModel])
async def read_inventory(
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)  # Add db dependency
):
    return await get_inventory_items(str(current_user.business_id), db)

@router.post("", response_model=InventoryItemModel, status_code=status.HTTP_201_CREATED)
async def create_item(
    item: InventoryItemCreate,
    current_user: UserInDB = Depends(get_current_admin_user),
    db = Depends(get_db)  # Add db dependency
):
    try:
        created_item = await create_inventory_item(str(current_user.business_id), item, db)
        return created_item
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# NOTE: barcode endpoint must come BEFORE the {item_id} endpoint to avoid routing conflicts
@router.get("/barcode/{barcode}", response_model=Optional[InventoryItemModel])
async def read_item_by_barcode(
    barcode: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)  # Add db dependency
):
    """Lookup an inventory item by its barcode"""
    item = await get_inventory_item_by_barcode(str(current_user.business_id), barcode, db)
    if not item:
        raise HTTPException(status_code=404, detail="Item with this barcode not found")
    return item

@router.get("/{item_id}", response_model=InventoryItemModel)
async def read_item(
    item_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)  # Add db dependency
):
    item = await get_inventory_item(str(current_user.business_id), item_id, db)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.put("/{item_id}", response_model=InventoryItemModel)
async def update_item(
    item_id: str,
    item: InventoryItemUpdate,
    current_user: UserInDB = Depends(get_current_admin_user),
    db = Depends(get_db)  # Add db dependency
):
    updated_item = await update_inventory_item(str(current_user.business_id), item_id, item, db)
    if not updated_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated_item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: str,
    current_user: UserInDB = Depends(get_current_admin_user),
    db = Depends(get_db)  # Add db dependency
):
    if not await delete_inventory_item(str(current_user.business_id), item_id, db):
        raise HTTPException(status_code=404, detail="Item not found")