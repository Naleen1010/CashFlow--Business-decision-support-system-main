from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.sale import (
    SaleCreate, SaleModel, SaleItemModel, SaleItemCreate,
    RefundCreate, RefundModel, RefundItemCreate,
    PaymentMethod, SaleStatus
)
from app.models.base import PyObjectId
from config import settings
from datetime import datetime
from typing import List, Optional, Dict, Tuple
import logging

logger = logging.getLogger(__name__)

async def get_default_tax_rate(db, business_id: str) -> float:
    """Get default tax rate from business settings"""
    try:
        business_id_obj = PyObjectId(business_id)
        settings_doc = await db.settings.find_one({"business_id": business_id_obj})
        
        if settings_doc:
            return settings_doc.get("default_tax_rate", 0)
        
        # Return 0 if no settings found
        return 0
    except Exception as e:
        logger.warning(f"Failed to get default tax rate: {str(e)}")
        return 0

async def validate_products_and_quantities(db, business_id: str, items: List[SaleItemCreate]) -> List[SaleItemModel]:
    """Validate products exist and have sufficient quantity"""
    detailed_items = []
    business_id_obj = PyObjectId(business_id)
    
    for item in items:
        try:
            # Convert string ID to PyObjectId
            product_id = PyObjectId(item.product_id)
            
            product = await db.inventory.find_one({
                "_id": product_id,
                "business_id": business_id_obj
            })
            
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID {item.product_id} not found in your inventory"
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
                
            detailed_items.append(SaleItemModel(
                product_id=product_id,
                category_id=product["category_id"],
                quantity=item.quantity,
                unit_price=product["price"],
                subtotal=product["price"] * item.quantity,
                product_name=product["name"].title(),
                category_name=category["name"].title()
            ))
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid product ID format: {str(e)}"
            )
    
    return detailed_items

async def calculate_sale_totals(
    items: List[SaleItemModel],
    tax_percentage: float,
    discount_percentage: float
) -> Tuple[float, float, float, float]:
    """Calculate sale totals including tax and discount"""
    subtotal = sum(item.subtotal for item in items)
    
    # Calculate discount
    discount = round(subtotal * (discount_percentage / 100), 2)
    
    # Calculate tax on discounted amount
    taxable_amount = subtotal - discount
    tax = round(taxable_amount * (tax_percentage / 100), 2)
    
    # Calculate total
    total_amount = round(taxable_amount + tax, 2)
    
    return subtotal, tax, discount, total_amount

async def update_inventory_quantities(db, items: List[SaleItemModel], is_refund: bool = False):
    """Update inventory quantities for sale or refund"""
    for item in items:
        quantity_change = item.quantity if is_refund else -item.quantity
        result = await db.inventory.update_one(
            {
                "_id": item.product_id,
                "quantity": {"$gte": -quantity_change if quantity_change < 0 else 0}
            },
            {"$inc": {"quantity": quantity_change}}
        )
        
        if result.modified_count == 0:
            # Check if product still exists
            product = await db.inventory.find_one({"_id": item.product_id})
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product {item.product_name} no longer exists"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient quantity for {item.product_name}"
                )

async def create_sale(business_id: str, sale: SaleCreate, db=None) -> SaleModel:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    try:
        # Validate customer if provided
        if sale.customer_id:
            customer = await db.customers.find_one({
                "_id": PyObjectId(sale.customer_id),
                "business_id": PyObjectId(business_id)
            })
            if not customer:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Customer not found"
                )
        
        # Get tax rate - use provided rate if specified, otherwise use default from settings
        tax_percentage = sale.tax_percentage
        
        # If tax rate is not specified or is 0, get default from settings
        if tax_percentage is None or tax_percentage == 0:
            default_tax_rate = await get_default_tax_rate(db, business_id)
            tax_percentage = default_tax_rate
            logger.info(f"Using default tax rate from settings: {default_tax_rate}%")
        else:
            logger.info(f"Using provided tax rate: {tax_percentage}%")
        
        # Validate products and quantities
        detailed_items = await validate_products_and_quantities(db, business_id, sale.items)
        
        # Calculate totals
        subtotal, tax, discount, total_amount = await calculate_sale_totals(
            detailed_items,
            tax_percentage,
            sale.discount_percentage
        )
        
        # Create sale document
        sale_doc = {
            "_id": PyObjectId(),
            "business_id": PyObjectId(business_id),
            "customer_id": PyObjectId(sale.customer_id) if sale.customer_id else None,
            "items": [item.model_dump() for item in detailed_items],
            "subtotal": subtotal,
            "total_amount": total_amount,
            "tax": tax,
            "tax_percentage": tax_percentage,  # Store the actual tax percentage used
            "discount": discount,
            "discount_percentage": sale.discount_percentage,
            "payment_method": sale.payment_method,
            "status": SaleStatus.COMPLETED,
            "timestamp": datetime.utcnow(),
            "is_refunded": False,
            "notes": sale.notes.strip() if sale.notes else None
        }
        
        # Update inventory
        await update_inventory_quantities(db, detailed_items)
        
        # Insert sale
        result = await db.sales.insert_one(sale_doc)
        return await get_sale(business_id, str(result.inserted_id), db)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create sale: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create sale: {str(e)}"
        )

async def get_sale(business_id: str, sale_id: str, db=None) -> Optional[SaleModel]:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    try:
        sale = await db.sales.find_one({
            "_id": PyObjectId(sale_id),
            "business_id": PyObjectId(business_id)
        })
        
        return SaleModel.model_validate(sale) if sale else None
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving sale: {str(e)}"
        )

async def get_sales(business_id: str, db=None) -> List[SaleModel]:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    try:
        # Convert business_id to string representation of PyObjectId
        business_id_obj = PyObjectId(business_id)
        
        # Debug: Print exact type and representation of business_id
        print(f"Business ID Type: {type(business_id)}")
        print(f"Business ID Value: {business_id}")
        print(f"Business ID PyObjectId: {business_id_obj}")
        
        # Perform a direct database query with different approaches
        print("Querying with PyObjectId:")
        sales_by_pyobjectid = await db.sales.find({
            "business_id": business_id_obj
        }).sort("timestamp", -1).to_list(None)
        print(f"Sales found by PyObjectId: {len(sales_by_pyobjectid)}")
        
        print("Querying with string representation:")
        sales_by_string = await db.sales.find({
            "business_id": str(business_id_obj)
        }).sort("timestamp", -1).to_list(None)
        print(f"Sales found by string: {len(sales_by_string)}")
        
        print("Querying with original business_id:")
        sales_by_original = await db.sales.find({
            "business_id": business_id
        }).sort("timestamp", -1).to_list(None)
        print(f"Sales found by original ID: {len(sales_by_original)}")
        
        # Choose the non-empty result set
        sales = (sales_by_pyobjectid or sales_by_string or sales_by_original)
        
        # Detailed logging of sales documents
        for sale in sales:
            print(f"Sale document details:")
            for key, value in sale.items():
                print(f"  {key}: {value}")
        
        # Convert to SaleModel with detailed error handling
        converted_sales = []
        for sale in sales:
            try:
                # Ensure all ObjectId fields are converted to strings
                sale['_id'] = str(sale['_id'])
                sale['business_id'] = str(sale['business_id'])
                if sale.get('customer_id'):
                    sale['customer_id'] = str(sale['customer_id'])
                
                # Convert items
                if 'items' in sale:
                    converted_items = []
                    for item in sale['items']:
                        converted_item = item.copy()
                        converted_item['product_id'] = str(converted_item['product_id'])
                        converted_item['category_id'] = str(converted_item['category_id'])
                        converted_items.append(converted_item)
                    sale['items'] = converted_items
                
                converted_sale = SaleModel.model_validate(sale)
                converted_sales.append(converted_sale)
            except Exception as conv_error:
                print(f"Error converting sale document: {conv_error}")
                print(f"Problematic sale document: {sale}")
        
        print(f"Final converted sales count: {len(converted_sales)}")
        
        return converted_sales
        
    except Exception as e:
        print(f"Full error retrieving sales: {type(e)}, {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving sales: {str(e)}"
        )

async def validate_refund_items(
    sale: SaleModel,
    refund_items: List[RefundItemCreate]
) -> List[SaleItemModel]:
    """Validate refund items against original sale"""
    sale_items_map = {str(item.product_id): item for item in sale.items}
    refund_items_list = []
    
    for item in refund_items:
        try:
            product_id = PyObjectId(item.product_id)
            original_item = sale_items_map.get(str(product_id))
            
            if not original_item:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product {item.product_id} not found in original sale"
                )
                
            if item.quantity > original_item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Refund quantity exceeds purchased quantity for {original_item.product_name}"
                )
                
            refund_items_list.append(SaleItemModel(
                product_id=original_item.product_id,
                category_id=original_item.category_id,
                quantity=item.quantity,
                unit_price=original_item.unit_price,
                subtotal=original_item.unit_price * item.quantity,
                product_name=original_item.product_name,
                category_name=original_item.category_name
            ))
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid product ID format: {str(e)}"
            )
    
    return refund_items_list

async def create_refund(
    business_id: str,
    sale_id: str,
    refund: RefundCreate,
    processed_by: str,
    db=None
) -> RefundModel:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    try:
        # Get and validate sale
        sale = await get_sale(business_id, sale_id, db)
        if not sale:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sale not found"
            )
        
        if sale.is_refunded:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sale already fully refunded"
            )
        
        # Validate refund items
        refund_items = await validate_refund_items(sale, refund.items)
        
        # Calculate refund amounts
        refund_subtotal = sum(item.subtotal for item in refund_items)
        
        # Use the tax percentage from the original sale
        tax_percentage = sale.tax_percentage if hasattr(sale, 'tax_percentage') else (sale.tax / sale.subtotal * 100)
        tax_refund = round(refund_subtotal * (tax_percentage / 100), 2)
        
        total_refund = round(refund_subtotal + tax_refund, 2)
        
        # Create refund document
        refund_doc = {
            "_id": PyObjectId(),
            "business_id": PyObjectId(business_id),
            "sale_id": PyObjectId(sale_id),
            "items": [item.model_dump() for item in refund_items],
            "reason": refund.reason,
            "subtotal": refund_subtotal,
            "tax_refund": tax_refund,
            "total_refund": total_refund,
            "payment_method": refund.payment_method,
            "notes": refund.notes.strip() if refund.notes else None,
            "timestamp": datetime.utcnow(),
            "processed_by": PyObjectId(processed_by)
        }
        
        # Update inventory
        await update_inventory_quantities(db, refund_items, is_refund=True)
        
        # Update sale status
        is_full_refund = refund_subtotal == sale.subtotal
        new_status = SaleStatus.REFUNDED if is_full_refund else SaleStatus.PARTIAL_REFUNDED
        
        await db.sales.update_one(
            {"_id": PyObjectId(sale_id)},
            {
                "$set": {
                    "is_refunded": is_full_refund,
                    "status": new_status
                }
            }
        )
        
        # Insert refund
        result = await db.refunds.insert_one(refund_doc)
        
        # Return created refund
        refund_record = await db.refunds.find_one({"_id": result.inserted_id})
        return RefundModel.model_validate(refund_record)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create refund: {str(e)}"
        )

async def get_refunds(business_id: str, sale_id: str, db=None) -> List[RefundModel]:
    """Get all refunds for a specific sale"""
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    try:
        refunds = await db.refunds.find({
            "business_id": PyObjectId(business_id),
            "sale_id": PyObjectId(sale_id)
        }).sort("timestamp", -1).to_list(None)
        
        return [RefundModel.model_validate(refund) for refund in refunds]
    
    except Exception as e:
        logger.error(f"Error getting refunds: {str(e)}")
        return []  # Return empty list instead of raising error