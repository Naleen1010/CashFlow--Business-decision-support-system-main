from fastapi import APIRouter, Depends, HTTPException, status
from app.models.order import OrderCreate, OrderModel, OrderStatus
from app.services.order_service import (
    create_order, get_order, get_orders,
    update_order, complete_order, cancel_order
)
from app.auth import get_current_user, get_current_admin_user
from app.models.user import UserInDB
from typing import List, Optional
from app.database import get_db  # Import the database dependency

router = APIRouter()

@router.post("", response_model=OrderModel, status_code=status.HTTP_201_CREATED)
async def create_new_order(
    order: OrderCreate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)  # Add db dependency
):
    return await create_order(str(current_user.business_id), order, db)

@router.get("", response_model=List[OrderModel])
async def read_orders(
    status: Optional[OrderStatus] = None,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)  # Add db dependency
):
    return await get_orders(str(current_user.business_id), status, db)

@router.get("/{order_id}", response_model=OrderModel)
async def read_order(
    order_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)  # Add db dependency
):
    order = await get_order(str(current_user.business_id), order_id, db)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/{order_id}", response_model=OrderModel)
async def update_existing_order(
    order_id: str,
    order: OrderCreate,
    current_user: UserInDB = Depends(get_current_admin_user),
    db = Depends(get_db)  # Add db dependency
):
    updated_order = await update_order(str(current_user.business_id), order_id, order, db)
    if not updated_order:
        raise HTTPException(status_code=404, detail="Order not found")
    return updated_order

@router.post("/{order_id}/complete", response_model=OrderModel)
async def complete_existing_order(
    order_id: str,
    current_user: UserInDB = Depends(get_current_admin_user),
    db = Depends(get_db)  # Add db dependency
):
    return await complete_order(str(current_user.business_id), order_id, db)

@router.post("/{order_id}/cancel", response_model=OrderModel)
async def cancel_existing_order(
    order_id: str,
    current_user: UserInDB = Depends(get_current_admin_user),
    db = Depends(get_db)  # Add db dependency
):
    return await cancel_order(str(current_user.business_id), order_id, db)