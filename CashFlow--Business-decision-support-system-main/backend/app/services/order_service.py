from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.order import (
    OrderCreate, OrderModel, OrderStatus,
    OrderItemModel, OrderItemCreate
)
from app.models.sale import SaleCreate, SaleItemCreate, PaymentMethod
from app.models.base import PyObjectId
from app.services.sale_service import create_sale, validate_products_and_quantities
from backend.config import settings
from datetime import datetime
from typing import List, Optional, Tuple

async def calculate_order_totals(
    db,
    business_id: str,
    items: List[OrderItemCreate],
    tax_percentage: float,
    discount_percentage: float,
) -> Tuple[List[OrderItemModel], float, float, float, float]:
    try:
        business_id_obj = PyObjectId(business_id)
        detailed_items = []
        
        for item in items:
            product_id = PyObjectId(item.product_id)
            product = await db.inventory.find_one({
                "_id": product_id,
                "business_id": business_id_obj
            })
            
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID {item.product_id} not found"
                )
                
            if product["quantity"] < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient quantity for {product['name'].title()}. Available: {product['quantity']}, Requested: {item.quantity}"
                )
            
            # Get category information
            category = await db.categories.find_one({
                "_id": product["category_id"],
                "business_id": business_id_obj
            })
            
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Category not found for product {product['name'].title()}"
                )
            
            detailed_items.append(OrderItemModel(
                product_id=product_id,
                category_id=product["category_id"],
                quantity=item.quantity,
                unit_price=product["price"],
                subtotal=product["price"] * item.quantity,
                product_name=product["name"].title(),
                category_name=category["name"].title()
            ))
        
        # Calculate totals
        subtotal = sum(item.subtotal for item in detailed_items)
        
        # Calculate discount
        discount_amount = round(subtotal * (discount_percentage / 100), 2)
        
        # Calculate tax on discounted amount
        taxable_amount = subtotal - discount_amount
        tax_amount = round(taxable_amount * (tax_percentage / 100), 2)
        
        # Calculate total
        total_amount = round(taxable_amount + tax_amount, 2)
        
        return detailed_items, subtotal, tax_amount, discount_amount, total_amount
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error calculating order totals: {str(e)}"
        )

async def create_order(business_id: str, order: OrderCreate) -> OrderModel:
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_NAME]
    
    try:
        # Validate customer exists
        customer = await db.customers.find_one({
            "_id": PyObjectId(order.customer_id),
            "business_id": PyObjectId(business_id)
        })
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        # Calculate totals and get detailed items
        detailed_items, subtotal, tax_amount, discount_amount, total_amount = (
            await calculate_order_totals(
                db,
                business_id,
                order.items,
                order.tax_percentage,
                order.discount_percentage
            )
        )
        
        # Create order document
        order_doc = {
            "_id": PyObjectId(),
            "business_id": PyObjectId(business_id),
            "customer_id": PyObjectId(order.customer_id),
            "items": [item.model_dump() for item in detailed_items],
            "subtotal": subtotal,
            "tax_amount": tax_amount,
            "discount_amount": discount_amount,
            "total_amount": total_amount,
            "status": OrderStatus.PENDING,
            "created_at": datetime.utcnow(),
            "delivery_date": order.delivery_date,
            "completed_at": None
        }
        
        # Insert order
        result = await db.orders.insert_one(order_doc)
        created_order = await get_order(business_id, str(result.inserted_id))
        
        if not created_order:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create order"
            )
            
        return created_order
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )
    
async def convert_order_to_sale_items(order_items: List[OrderItemModel]) -> List[SaleItemCreate]:
    """Convert order items to sale items for sale creation"""
    return [
        SaleItemCreate(
            product_id=str(item.product_id),
            quantity=item.quantity
        ) for item in order_items
    ]

async def complete_order(business_id: str, order_id: str) -> OrderModel:
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_NAME]
    
    try:
        # Get the order
        order = await get_order(business_id, order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
            
        if order.status != OrderStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only complete pending orders"
            )
        
        # Convert order items to sale items
        sale_items = await convert_order_to_sale_items(order.items)
        
        # Create the sale
        sale_create = SaleCreate(
            customer_id=order.customer_id,
            items=sale_items,
            tax_percentage=(order.tax_amount / order.subtotal * 100) if order.subtotal > 0 else 0,
            discount_percentage=(order.discount_amount / order.subtotal * 100) if order.subtotal > 0 else 0,
            payment_method=PaymentMethod.CASH,  # Default payment method
            notes=f"Order #{order_id} completion"
        )
        
        # Create the sale (this will handle inventory updates)
        created_sale = await create_sale(business_id, sale_create)
        
        # Update order status and link to sale
        result = await db.orders.update_one(
            {"_id": order.id},
            {
                "$set": {
                    "status": OrderStatus.COMPLETED,
                    "completed_at": datetime.utcnow(),
                    "sale_id": created_sale.id
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update order status"
            )
        
        return await get_order(business_id, order_id)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete order: {str(e)}"
        )
    

async def get_order(business_id: str, order_id: str) -> Optional[OrderModel]:
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_NAME]
    
    try:
        order = await db.orders.find_one({
            "_id": PyObjectId(order_id),
            "business_id": PyObjectId(business_id)
        })
        
        return OrderModel.model_validate(order) if order else None
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving order: {str(e)}"
        )

async def get_orders(business_id: str, status: Optional[OrderStatus] = None) -> List[OrderModel]:
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_NAME]
    
    try:
        query = {"business_id": PyObjectId(business_id)}
        if status:
            query["status"] = status
        
        orders = await db.orders.find(query).sort("created_at", -1).to_list(None)
        return [OrderModel.model_validate(order) for order in orders]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving orders: {str(e)}"
        )

async def update_order(business_id: str, order_id: str, order: OrderCreate) -> Optional[OrderModel]:
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_NAME]
    
    try:
        # Get existing order
        existing_order = await get_order(business_id, order_id)
        if not existing_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
            
        if existing_order.status != OrderStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only update pending orders"
            )
        
        # Validate customer still exists
        customer = await db.customers.find_one({
            "_id": PyObjectId(order.customer_id),
            "business_id": PyObjectId(business_id)
        })
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        # Calculate new totals
        detailed_items, subtotal, tax_amount, discount_amount, total_amount = (
            await calculate_order_totals(
                db,
                business_id,
                order.items,
                order.tax_percentage,
                order.discount_percentage
            )
        )
        
        # Update order
        update_data = {
            "items": [item.model_dump() for item in detailed_items],
            "subtotal": subtotal,
            "tax_amount": tax_amount,
            "discount_amount": discount_amount,
            "total_amount": total_amount,
            "delivery_date": order.delivery_date
        }
        
        result = await db.orders.update_one(
            {"_id": PyObjectId(order_id), "business_id": PyObjectId(business_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update order"
            )
            
        return await get_order(business_id, order_id)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update order: {str(e)}"
        )

async def cancel_order(business_id: str, order_id: str) -> OrderModel:
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_NAME]
    
    try:
        # Get the order
        order = await get_order(business_id, order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
            
        if order.status != OrderStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only cancel pending orders"
            )
        
        # Update order status
        result = await db.orders.update_one(
            {"_id": PyObjectId(order_id), "business_id": PyObjectId(business_id)},
            {
                "$set": {
                    "status": OrderStatus.CANCELLED,
                    "completed_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to cancel order"
            )
        
        return await get_order(business_id, order_id)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error cancelling order: {str(e)}"
        )

# Optional: Add helper function for customer validation
async def validate_customer(db, business_id: str, customer_id: str) -> bool:
    try:
        customer = await db.customers.find_one({
            "_id": PyObjectId(customer_id),
            "business_id": PyObjectId(business_id)
        })
        return customer is not None
    except:
        return False