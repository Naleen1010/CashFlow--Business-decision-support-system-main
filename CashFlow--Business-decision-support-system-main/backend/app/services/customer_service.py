from fastapi import HTTPException, status
from app.models.customer import CustomerCreate, CustomerUpdate, CustomerModel
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
from app.models.base import PyObjectId
from typing import List, Optional
import re

async def check_email_exists(db, business_id: str, email: str, exclude_id: Optional[str] = None) -> bool:
    query = {
        "business_id": PyObjectId(business_id),
        "email": email.lower().strip()
    }
    if exclude_id:
        query["_id"] = {"$ne": PyObjectId(exclude_id)}
        
    existing = await db.customers.find_one(query)
    return existing is not None

async def check_phone_exists(db, business_id: str, phone: str, exclude_id: Optional[str] = None) -> bool:
    query = {
        "business_id": PyObjectId(business_id),
        "phone": phone.strip()
    }
    if exclude_id:
        query["_id"] = {"$ne": PyObjectId(exclude_id)}
        
    existing = await db.customers.find_one(query)
    return existing is not None

def validate_email(email: str) -> bool:
    """Validate email format"""
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None

def validate_phone(phone: str) -> bool:
    """Validate phone number format - simple 10 digit validation"""
    # Remove all non-digit characters
    digits_only = re.sub(r'\D', '', phone)
    # Check if we have 10 digits
    return len(digits_only) == 10

def normalize_phone(phone: str) -> str:
    """Format phone number as XXX-XXX-XXXX"""
    # Remove all non-digit characters
    digits_only = re.sub(r'\D', '', phone)
    
    if len(digits_only) != 10:
        return digits_only
        
    # Format as XXX-XXX-XXXX
    return f"{digits_only[:3]}-{digits_only[3:6]}-{digits_only[6:]}"

async def get_customers(business_id: str, db=None) -> List[CustomerModel]:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    try:
        customers = await db.customers.find({"business_id": PyObjectId(business_id)}).to_list(None)
        return [CustomerModel.model_validate(customer) for customer in customers]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving customers: {str(e)}"
        )

async def get_customer(business_id: str, customer_id: str, db=None) -> Optional[CustomerModel]:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    try:
        customer = await db.customers.find_one({
            "_id": PyObjectId(customer_id), 
            "business_id": PyObjectId(business_id)
        })
        return CustomerModel.model_validate(customer) if customer else None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving customer: {str(e)}"
        )

async def create_customer(business_id: str, customer: CustomerCreate, db=None) -> CustomerModel:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    try:
        # Validate email format
        if not validate_email(customer.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Check if email already exists
        if await check_email_exists(db, business_id, customer.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Validate and check phone if provided
        if customer.phone:
            # Normalize phone number
            normalized_phone = normalize_phone(customer.phone)
            
            # Validate phone format
            if not validate_phone(normalized_phone):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid phone number format"
                )
            
            # Check if phone already exists
            if await check_phone_exists(db, business_id, normalized_phone):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Phone number already registered"
                )
        
        # Create customer document
        customer_doc = {
            "_id": PyObjectId(),
            "business_id": PyObjectId(business_id),
            "name": customer.name.strip(),
            "email": customer.email.lower().strip(),
            "phone": normalize_phone(customer.phone) if customer.phone else None,
            "address": customer.address.strip() if customer.address else None,
            "discount_eligibility": customer.discount_eligibility,
            "purchase_history": []
        }
        
        result = await db.customers.insert_one(customer_doc)
        created_customer = await get_customer(business_id, str(result.inserted_id), db)
        
        if not created_customer:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create customer"
            )
            
        return created_customer
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating customer: {str(e)}"
        )

async def update_customer(
    business_id: str,
    customer_id: str,
    customer: CustomerUpdate,
    db=None
) -> Optional[CustomerModel]:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    try:
        # Check if customer exists
        existing = await get_customer(business_id, customer_id, db)
        if not existing:
            return None
            
        # Check email uniqueness if being updated
        if customer.email and customer.email.lower().strip() != existing.email:
            # Validate email format
            if not validate_email(customer.email):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid email format"
                )
            
            # Check email uniqueness
            if await check_email_exists(db, business_id, customer.email, customer_id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        # Check phone uniqueness if being updated
        if customer.phone and normalize_phone(customer.phone) != (existing.phone or ''):
            # Normalize phone number
            normalized_phone = normalize_phone(customer.phone)
            
            # Validate phone format
            if not validate_phone(normalized_phone):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid phone number format"
                )
            
            # Check phone uniqueness
            if await check_phone_exists(db, business_id, normalized_phone, customer_id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Phone number already registered"
                )
        
        # Build update data
        update_data = {}
        if customer.name is not None:
            update_data["name"] = customer.name.strip()
        if customer.email is not None:
            update_data["email"] = customer.email.lower().strip()
        if customer.phone is not None:
            update_data["phone"] = normalize_phone(customer.phone) if customer.phone else None
        if customer.address is not None:
            update_data["address"] = customer.address.strip() if customer.address else None
        if customer.discount_eligibility is not None:
            update_data["discount_eligibility"] = customer.discount_eligibility
        
        if update_data:
            result = await db.customers.update_one(
                {"_id": PyObjectId(customer_id), "business_id": PyObjectId(business_id)},
                {"$set": update_data}
            )
            
            if result.modified_count:
                return await get_customer(business_id, customer_id, db)
                
        return existing
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating customer: {str(e)}"
        )

async def delete_customer(business_id: str, customer_id: str, db=None) -> bool:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    try:
        # Check if customer has any orders or sales
        has_orders = await db.orders.find_one({
            "business_id": PyObjectId(business_id),
            "customer_id": PyObjectId(customer_id)
        })
        
        has_sales = await db.sales.find_one({
            "business_id": PyObjectId(business_id),
            "customer_id": PyObjectId(customer_id)
        })
        
        if has_orders or has_sales:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete customer with existing orders or sales"
            )
        
        result = await db.customers.delete_one({
            "_id": PyObjectId(customer_id), 
            "business_id": PyObjectId(business_id)
        })
        
        return result.deleted_count > 0
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting customer: {str(e)}"
        )
    
async def search_customers(business_id: str, query: str, db=None) -> List[CustomerModel]:
    """
    Search customers by name, email, or phone
    Returns list of matching customers
    """
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    try:
        # Create case-insensitive search pattern
        search_pattern = re.compile(f".*{query}.*", re.IGNORECASE)
        
        # Search across multiple fields
        customers = await db.customers.find({
            "business_id": PyObjectId(business_id),
            "$or": [
                {"name": {"$regex": search_pattern}},
                {"email": {"$regex": search_pattern}},
                {"phone": {"$regex": search_pattern}}
            ]
        }).limit(10).to_list(None)
        
        return [CustomerModel.model_validate(customer) for customer in customers]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching customers: {str(e)}"
        )