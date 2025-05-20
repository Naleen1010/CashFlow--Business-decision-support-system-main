# app/routers/customers.py
import re
from fastapi import APIRouter, Depends, HTTPException, Request, status
from app.models import settings
from app.models.base import PyObjectId
from app.models.customer import CustomerCreate, CustomerUpdate, CustomerModel
from app.services.customer_service import get_customers, get_customer, create_customer, update_customer, delete_customer, search_customers
from app.auth import get_current_user, get_current_admin_user
from app.models.user import UserInDB
from typing import List
from motor.motor_asyncio import AsyncIOMotorClient
from app.database import get_db  # Import the database dependency

# Remove the prefix - it's already added in main.py
router = APIRouter()

# Search endpoint (must come before {customer_id} routes)
@router.get("/search")
async def search_customers_endpoint(
    query: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)  # Add db dependency
):
    """
    Search customers by name, email, or phone number.
    Uses the database dependency for MongoDB connection.
    """
    try:
        return await search_customers(str(current_user.business_id), query, db)
    except Exception as e:
        print(f"Search error: {str(e)}")  # Debug log
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching customers: {str(e)}"
        )

@router.get("", response_model=List[CustomerModel])
async def read_customers(
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)  # Add db dependency
):
    return await get_customers(str(current_user.business_id), db)

@router.post("", response_model=CustomerModel)
async def create_new_customer(
    customer: CustomerCreate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)  # Add db dependency
):
    return await create_customer(str(current_user.business_id), customer, db)

@router.get("/{customer_id}", response_model=CustomerModel)
async def read_customer(
    customer_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)  # Add db dependency
):
    customer = await get_customer(str(current_user.business_id), customer_id, db)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/{customer_id}", response_model=CustomerModel)
async def update_existing_customer(
    customer_id: str,
    customer: CustomerUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)  # Add db dependency
):
    updated_customer = await update_customer(str(current_user.business_id), customer_id, customer, db)
    if not updated_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return updated_customer

@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_customer(
    customer_id: str,
    current_user: UserInDB = Depends(get_current_admin_user),
    db = Depends(get_db)  # Add db dependency
):
    if not await delete_customer(str(current_user.business_id), customer_id, db):
        raise HTTPException(status_code=404, detail="Customer not found")