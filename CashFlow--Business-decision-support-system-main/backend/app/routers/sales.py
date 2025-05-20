from fastapi import APIRouter, Depends, HTTPException, status
from app.models.sale import SaleCreate, SaleModel, RefundCreate, RefundModel
from app.services.sale_service import (
    create_sale, get_sale, get_sales,
    create_refund, get_refunds
)
from app.auth import get_current_user, get_current_admin_user
from app.models.user import UserInDB
from typing import List
from app.database import get_db  # Import the database dependency

router = APIRouter()

@router.get("", response_model=List[SaleModel])
async def read_sales(
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)  # Add db dependency
):
    return await get_sales(str(current_user.business_id), db)

@router.post("", response_model=SaleModel, status_code=status.HTTP_201_CREATED)
async def create_new_sale(
    sale: SaleCreate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)  # Add db dependency
):
    return await create_sale(str(current_user.business_id), sale, db)

@router.get("/{sale_id}", response_model=SaleModel)
async def read_sale(
    sale_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)  # Add db dependency
):
    sale = await get_sale(str(current_user.business_id), sale_id, db)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale

@router.post("/{sale_id}/refund", response_model=RefundModel)
async def refund_sale(
    sale_id: str,
    refund: RefundCreate,
    current_user: UserInDB = Depends(get_current_admin_user),
    db = Depends(get_db)  # Add db dependency
):
    return await create_refund(
        business_id=str(current_user.business_id),
        sale_id=sale_id,
        refund=refund,
        processed_by=str(current_user.id),
        db=db
    )

@router.get("/{sale_id}/refunds", response_model=List[RefundModel])
async def get_sale_refunds(
    sale_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)  # Add db dependency
):
    return await get_refunds(
        business_id=str(current_user.business_id),
        sale_id=sale_id,
        db=db
    )