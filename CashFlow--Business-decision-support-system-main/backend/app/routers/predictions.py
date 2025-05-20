from fastapi import APIRouter, Depends, HTTPException, Query, Body, status
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.auth import get_current_user, get_current_admin_user
from app.models.user import UserInDB
from app.database import get_db
from app.services.prediction_service import (
    make_prediction,
    predict_product_sales,
    get_model_status,
    get_feature_importance,
    prepare_features
)
from app.services.model_training_service import train_models_for_business
from datetime import datetime, timedelta
import os
import json
PREDICTIONS_CACHE = {}
CACHE_DURATION = 60 * 60  # Cache duration in seconds (1 hour)
PREDICTIONS_LAST_CALCULATED = {}

router = APIRouter()

# Pydantic models for request/response validation
class PredictionRequest(BaseModel):
    product_id: str
    category: Optional[str] = None
    include_history: Optional[bool] = False
    horizon: Optional[str] = "daily"  # daily, weekly, monthly

class BatchPredictionRequest(BaseModel):
    product_ids: List[str]
    horizon: Optional[str] = "daily"  # daily, weekly, monthly

class TrainModelRequest(BaseModel):
    force_retrain: Optional[bool] = False

class PredictionResponse(BaseModel):
    success: bool
    product_id: Optional[str] = None
    prediction: Optional[float] = None
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    horizon: Optional[str] = None
    error: Optional[str] = None
    timestamp: Optional[str] = None

class BatchPredictionResponse(BaseModel):
    success: bool
    predictions: Optional[List[Dict[str, Any]]] = None
    horizon: Optional[str] = None
    error: Optional[str] = None
    timestamp: Optional[str] = None

class TrainModelResponse(BaseModel):
    success: bool
    models: Optional[List[str]] = None
    error: Optional[str] = None
    data_points: Optional[int] = None
    feature_importance: Optional[Dict[str, float]] = None

@router.post("/train", response_model=TrainModelResponse)
async def train_model(
    request: TrainModelRequest = Body(...),
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Train sales prediction models for the current business
    """
    business_id = str(current_user.business_id)
    
    try:
        # Train models
        result = await train_models_for_business(business_id, request.force_retrain, db)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/predict", response_model=PredictionResponse)
async def predict_product(
    request: PredictionRequest,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Predict sales for a specific product
    """
    business_id = str(current_user.business_id)
    
    try:
        prediction = await predict_product_sales(
            business_id=business_id,
            product_id=request.product_id,
            category=request.category,
            include_history=request.include_history,
            horizon=request.horizon,
            db=db
        )
        return prediction
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/model-status")
async def get_models_status(
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get status of trained models for the current business
    """
    business_id = str(current_user.business_id)
    return await get_model_status(business_id, db)

@router.get("/feature-importance")
async def get_features_importance(
    horizon: str = Query("daily", regex="^(daily|weekly|monthly)$"),
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get feature importance for the trained model
    """
    business_id = str(current_user.business_id)
    
    result = await get_feature_importance(business_id, horizon, db)
    
    if not result.get("success"):
        return {
            "success": False,
            "error": f"No feature importance data found for {horizon} model. Please train models first."
        }
    
    return result

@router.get("/top-products")
async def get_top_selling_products(
    limit: int = Query(10, ge=1, le=100),
    refresh: bool = Query(False),  # New parameter to force refresh
    category: Optional[str] = None,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get top predicted selling products for all time horizons (daily, weekly, monthly)
    
    - limit: maximum number of products to return per horizon
    - refresh: whether to force a recalculation (default: False)
    - category: optional filter by category
    """
    business_id = str(current_user.business_id)
    cache_key = f"{business_id}_{limit}_{category}"
    
    # Check if predictions are in cache and not expired
    now = datetime.now()
    last_calculated = PREDICTIONS_LAST_CALCULATED.get(cache_key)
    
    # Return cached predictions if available and not forcing refresh
    if not refresh and cache_key in PREDICTIONS_CACHE and last_calculated:
        cache_age = (now - last_calculated).total_seconds()
        if cache_age < CACHE_DURATION:
            print(f"Returning cached predictions for {business_id}, age: {cache_age:.1f} seconds")
            return PREDICTIONS_CACHE[cache_key]
    
    # Check if models exist
    model_status = await get_model_status(business_id, db)
    horizons = ["daily", "weekly", "monthly"]
    missing_models = [h for h in horizons if not model_status.get("models", {}).get(h, {}).get("exists", False)]
    
    if missing_models:
        return {
            "success": False,
            "error": f"Models for {', '.join(missing_models)} predictions not trained yet. Please train models first."
        }
    
    # Start the actual prediction logic only when refresh=True or cache expired
    try:
        print(f"Calculating new predictions for {business_id}")
        
        # Get all products from inventory
        from app.services.inventory_service import get_inventory_items
        all_products = await get_inventory_items(business_id, db)
        
        # Filter by category if specified
        if category:
            all_products = [p for p in all_products if p.category_name and p.category_name.lower() == category.lower()]
        
        if not all_products:
            return {
                "success": False,
                "error": "No products found in inventory" if not category else f"No products found in category: {category}"
            }
        
        # Get sales data to provide history for predictions
        from app.services.sale_service import get_sales
        all_sales = await get_sales(business_id, db)
        
        # Create a dict to store product sales history
        product_history = {}
        
        # Extract sales history for each product
        for sale in all_sales:
            sale_dict = sale.model_dump()
            for item in sale_dict.get("items", []):
                product_id = str(item.get("product_id"))
                if product_id not in product_history:
                    product_history[product_id] = []
                
                product_history[product_id].append({
                    "date": sale_dict.get("timestamp"),
                    "quantity": item.get("quantity", 0),
                    "total": item.get("subtotal", 0)
                })
        
        # Dictionary to store predictions for all horizons
        all_horizon_predictions = {}
        
        # Get predictions for each product across all horizons
        for horizon in horizons:
            predictions = []
            for product in all_products:
                # Get product history
                history = product_history.get(str(product.id), [])
                
                # Prepare features
                features = await prepare_features(
                    product_id=str(product.id),
                    category=product.category_name or "Uncategorized",
                    product_history=history
                )
                
                # Make prediction
                prediction = await make_prediction(
                    business_id=business_id,
                    product_data=features,
                    horizon=horizon
                )
                
                if prediction.get("success"):
                    # Round predictions to integers
                    predicted_quantity = round(prediction.get("prediction", 0))
                    lower_bound = round(prediction.get("lower_bound", 0))
                    upper_bound = round(prediction.get("upper_bound", 0))
                    
                    predictions.append({
                        "product_id": str(product.id),
                        "product_name": product.name,
                        "category": product.category_name or "Uncategorized",
                        "prediction": predicted_quantity,  # Integer prediction
                        "lower_bound": lower_bound,  # Integer lower bound
                        "upper_bound": upper_bound,  # Integer upper bound
                        "current_stock": product.quantity,
                        "price": product.price
                    })
            
            # Sort predictions by prediction value (highest first)
            predictions.sort(key=lambda x: x["prediction"], reverse=True)
            
            # Limit to requested number
            predictions = predictions[:limit]
            
            # Store for this horizon
            all_horizon_predictions[horizon] = predictions
        
        # Prepare response
        result = {
            "success": True,
            "predictions": {
                "daily": all_horizon_predictions["daily"],
                "weekly": all_horizon_predictions["weekly"],
                "monthly": all_horizon_predictions["monthly"]
            },
            "timestamp": now.isoformat()
        }
        
        # Cache the result
        PREDICTIONS_CACHE[cache_key] = result
        PREDICTIONS_LAST_CALCULATED[cache_key] = now
        
        return result
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {"success": False, "error": str(e)}
    
@router.get("/diagnostics")
async def get_prediction_diagnostics(
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get diagnostics information about the prediction system
    """
    business_id = str(current_user.business_id)
    
    try:
        # Get model status
        model_status = await get_model_status(business_id, db)
        
        # Get feature importance for the daily model
        feature_importance = await get_feature_importance(business_id, "daily", db)
        
        # Get sales data to determine history length
        from app.services.sale_service import get_sales
        all_sales = await get_sales(business_id, db)
        
        # Calculate statistics from sales data
        sales_count = len(all_sales)
        
        # Extract unique products and categories
        unique_products = set()
        unique_categories = set()
        total_items = 0
        dates = []
        
        for sale in all_sales:
            sale_dict = sale.model_dump()
            dates.append(sale_dict.get("timestamp", ""))
            
            for item in sale_dict.get("items", []):
                unique_products.add(str(item.get("product_id", "")))
                unique_categories.add(item.get("category_name", "Uncategorized"))
                total_items += item.get("quantity", 0)
        
        # Calculate date range
        date_objects = [datetime.fromisoformat(d.replace('Z', '+00:00')) if isinstance(d, str) else d for d in dates if d]
        
        earliest_date = min(date_objects).isoformat() if date_objects else datetime.now().isoformat()
        latest_date = max(date_objects).isoformat() if date_objects else datetime.now().isoformat()
        
        # Calculate days of history
        if date_objects:
            days_of_history = (max(date_objects) - min(date_objects)).days + 1
        else:
            days_of_history = 0
        
        # Determine prediction tier based on data quantity
        if days_of_history < 7:
            prediction_tier = "none"
        elif days_of_history < 30:
            prediction_tier = "basic"
        else:
            prediction_tier = "ml"
        
        return {
            "status": "success" if model_status.get("all_models_available", False) else "warning",
            "business_id": business_id,
            "sales_records": sales_count,
            "days_of_history": days_of_history,
            "earliest_date": earliest_date,
            "latest_date": latest_date,
            "unique_products": len(unique_products),
            "unique_categories": len(unique_categories),
            "total_items_sold": total_items,
            "model_directory": "models",
            "prediction_tier": prediction_tier,
            "message": "Models are ready" if model_status.get("all_models_available", False) else "Models need training"
        }
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {
            "status": "error",
            "business_id": business_id,
            "sales_records": 0,
            "days_of_history": 0,
            "earliest_date": datetime.now().isoformat(),
            "latest_date": datetime.now().isoformat(),
            "unique_products": 0,
            "unique_categories": 0,
            "total_items_sold": 0,
            "model_directory": "models",
            "prediction_tier": "none",
            "message": str(e)
        }