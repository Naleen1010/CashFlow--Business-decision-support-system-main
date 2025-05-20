import pandas as pd
import numpy as np
import os
import joblib
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging
from app.services.sale_service import get_sales, get_sale
from app.services.inventory_service import get_inventory_item  # Fixed import name

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Path to models directory
MODEL_DIR = os.path.join(os.getcwd(), "models")
os.makedirs(MODEL_DIR, exist_ok=True)

# Cache for loaded models to improve performance
MODEL_CACHE = {}

async def predict_product_sales(
    business_id: str,
    product_id: str,
    category: Optional[str] = None,
    include_history: bool = False,
    horizon: str = "daily",
    db = None
) -> Dict[str, Any]:
    """
    Predict sales for a specific product
    
    Args:
        business_id: The business ID
        product_id: The product ID
        category: Optional category name
        include_history: Whether to include sales history
        horizon: Prediction horizon (daily, weekly, monthly)
        db: Database connection
        
    Returns:
        Dictionary with prediction results
    """
    # Check if models exist
    model_status = await get_model_status(business_id, db)
    if not model_status.get("models", {}).get(horizon, {}).get("exists", False):
        return {
            "success": False,
            "error": f"Model for {horizon} predictions not trained yet. Please train models first."
        }
    
    try:
        # Get product details if category not provided
        if not category:
            # Using get_inventory_item instead of get_product
            product = await get_inventory_item(business_id, product_id, db)
            if product:
                category = product.category_name or "Uncategorized"
            else:
                category = "Uncategorized"
        
        # Get product sales history
        product_history = []
        if include_history:
            # Get sales data and filter for this product
            # This is a simplified approach - adapt to your data structure
            all_sales = await get_sales(business_id, db)
            
            for sale in all_sales:
                # Convert to dict to make manipulation easier
                sale_dict = sale.model_dump()
                # Find items in this sale that match our product
                for item in sale_dict.get("items", []):
                    if str(item.get("product_id")) == product_id:
                        # Add this to our history
                        product_history.append({
                            "date": sale_dict.get("timestamp"),
                            "quantity": item.get("quantity", 0),
                            "total": item.get("subtotal", 0)
                        })
        
        # Prepare features
        features = await prepare_features(
            product_id=product_id,
            category=category,
            product_history=product_history
        )
        
        # Load model and make prediction
        prediction = await make_prediction(
            business_id=business_id,
            product_data=features,
            horizon=horizon
        )
        
        return prediction
    except Exception as e:
        logger.error(f"Error predicting sales: {e}", exc_info=True)
        return {"success": False, "error": str(e)}

async def prepare_features(
    product_id: str,
    category: str,
    product_history: List[Dict]
) -> Dict[str, Any]:
    """
    Prepare features for a product prediction
    
    Args:
        product_id: Product ID
        category: Product category
        product_history: List of historical sales records for this product
        
    Returns:
        Dictionary with features for prediction
    """
    today = datetime.now().date()
    
    # Default feature values
    features = {
        "product_id": product_id,
        "category": category,
        "year": today.year,
        "month": today.month,
        "day": today.day,
        "dayofweek": today.weekday(),
        "quarter": (today.month - 1) // 3 + 1,
        "is_month_start": 1 if today.day == 1 else 0,
        "is_month_end": 1 if today.day == pd.Timestamp(today).days_in_month else 0,
        "is_weekend": 1 if today.weekday() >= 5 else 0,
        "sales_last_7_days": 0,
        "sales_last_30_days": 0,
        "quantity_last_7_days": 0,
        "quantity_last_30_days": 0,
        "days_since_last_sale": 999,
        "sales_trend": 0,
        "prev_day_quantity": 0,
        "prev_week_quantity": 0
    }
    
    # If no history, return default features
    if not product_history:
        return features
    
    # Convert history to DataFrame
    history_df = pd.DataFrame(product_history)
    
    # Ensure date column is datetime
    history_df['date'] = pd.to_datetime(history_df['date'])
    
    # Sort by date
    history_df = history_df.sort_values('date')
    
    # Calculate rolling aggregations
    if len(history_df) > 0:
        # Last 7 days sales
        sales_7d = history_df[history_df['date'] >= pd.Timestamp(today) - timedelta(days=7)]
        features['sales_last_7_days'] = sales_7d['total'].sum() if 'total' in sales_7d.columns else 0
        features['quantity_last_7_days'] = sales_7d['quantity'].sum() if 'quantity' in sales_7d.columns else 0
        
        # Last 30 days sales
        sales_30d = history_df[history_df['date'] >= pd.Timestamp(today) - timedelta(days=30)]
        features['sales_last_30_days'] = sales_30d['total'].sum() if 'total' in sales_30d.columns else 0
        features['quantity_last_30_days'] = sales_30d['quantity'].sum() if 'quantity' in sales_30d.columns else 0
        
        # Sales trend (recent vs longer term)
        if features['sales_last_30_days'] > 0:
            features['sales_trend'] = (
                (features['sales_last_7_days'] * (30/7) - features['sales_last_30_days']) / 
                features['sales_last_30_days']
            )
        
        # Days since last sale
        latest_sale = history_df['date'].max()
        if pd.notna(latest_sale):
            days_diff = (pd.Timestamp(today) - latest_sale).days
            features['days_since_last_sale'] = min(days_diff, 365)
        
        # Previous day quantity
        prev_day = history_df[history_df['date'] == pd.Timestamp(today) - timedelta(days=1)]
        if len(prev_day) > 0:
            features['prev_day_quantity'] = prev_day['quantity'].sum() if 'quantity' in prev_day.columns else 0
        
        # Previous week (same day) quantity
        prev_week = history_df[history_df['date'] == pd.Timestamp(today) - timedelta(days=7)]
        if len(prev_week) > 0:
            features['prev_week_quantity'] = prev_week['quantity'].sum() if 'quantity' in prev_week.columns else 0
    
    return features

async def load_model(business_id: str, horizon: str) -> Any:
    """
    Load a model from disk or from cache
    
    Args:
        business_id: The business ID
        horizon: The prediction horizon (daily, weekly, monthly)
        
    Returns:
        The loaded model or None if not found
    """
    cache_key = f"{business_id}_{horizon}"
    
    # Check if model is already in cache
    if cache_key in MODEL_CACHE:
        return MODEL_CACHE[cache_key]
    
    # Load model from disk
    model_path = os.path.join(MODEL_DIR, f"{business_id}_{horizon}_model.pkl")
    
    if not os.path.exists(model_path):
        logger.warning(f"Model not found at {model_path}")
        return None
    
    try:
        model = joblib.load(model_path)
        # Add to cache
        MODEL_CACHE[cache_key] = model
        return model
    except Exception as e:
        logger.error(f"Error loading model: {e}", exc_info=True)
        return None

async def make_prediction(
    business_id: str,
    product_data: Dict[str, Any],
    horizon: str = 'daily'
) -> Dict[str, Any]:
    """
    Make a prediction for a product
    
    Args:
        business_id: Business ID
        product_data: Product data including features
        horizon: Prediction horizon (daily, weekly, monthly)
        
    Returns:
        Dictionary with prediction results
    """
    # Load model
    model = await load_model(business_id, horizon)
    
    if model is None:
        return {
            "success": False,
            "error": f"Model for {horizon} predictions not found"
        }
    
    try:
        # Convert features to DataFrame
        features_df = pd.DataFrame([product_data])
        
        # Make prediction
        prediction = model.predict(features_df)[0]
        
        # Get confidence interval (simplified approach)
        prediction_value = float(prediction)
        uncertainty = 0.2 * prediction_value  # 20% uncertainty as a simplified approach
        
        return {
            "success": True,
            "product_id": product_data.get('product_id', 'unknown'),
            "horizon": horizon,
            "prediction": prediction_value,
            "lower_bound": max(0, prediction_value - uncertainty),
            "upper_bound": prediction_value + uncertainty,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error making prediction: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e)
        }

async def get_model_status(business_id: str, db = None) -> Dict[str, Any]:
    """
    Get status of trained models for a business
    
    Args:
        business_id: Business ID
        db: Database connection
        
    Returns:
        Dictionary with model status information
    """
    horizons = ['daily', 'weekly', 'monthly']
    status = {
        "business_id": business_id,
        "models": {}
    }
    
    for horizon in horizons:
        model_path = os.path.join(MODEL_DIR, f"{business_id}_{horizon}_model.pkl")
        model_exists = os.path.exists(model_path)
        
        if model_exists:
            model_stats = os.stat(model_path)
            creation_time = datetime.fromtimestamp(model_stats.st_ctime)
            
            status["models"][horizon] = {
                "exists": True,
                "created_at": creation_time.isoformat(),
                "file_size_bytes": model_stats.st_size
            }
        else:
            status["models"][horizon] = {
                "exists": False
            }
    
    status["all_models_available"] = all(status["models"][h]["exists"] for h in horizons)
    
    return status

async def get_feature_importance(business_id: str, horizon: str = 'daily', db = None) -> Dict[str, Any]:
    """
    Get feature importance from a trained model
    
    Args:
        business_id: Business ID
        horizon: Model name (daily, weekly, monthly)
        db: Database connection
        
    Returns:
        Dictionary with feature importance information
    """
    # Load the model
    model = await load_model(business_id, horizon)
    
    if model is None:
        return {
            "success": False,
            "error": f"Model for {horizon} predictions not found"
        }
    
    try:
        # Extract feature names from the pipeline
        feature_names = []
        
        # Try to get feature names from the pipeline
        preprocessor = model.named_steps['preprocessor']
        feature_names_out = []
        
        # Get numerical feature names
        if hasattr(preprocessor, 'transformers_'):
            for name, transformer, columns in preprocessor.transformers_:
                if name == 'num':
                    feature_names_out.extend(columns)
                elif name == 'cat' and hasattr(transformer, 'get_feature_names_out'):
                    # For categorical features, get encoded feature names
                    cat_features = transformer.get_feature_names_out(columns)
                    feature_names_out.extend(cat_features)
        
        feature_names = feature_names_out
        
        # If feature names extraction failed, use generic names
        if not feature_names:
            feature_names = [f"feature_{i}" for i in range(len(model.named_steps['regressor'].feature_importances_))]
        
        # Get feature importances
        importances = model.named_steps['regressor'].feature_importances_
        
        # Create dictionary of feature importance
        feature_importance = {}
        for feature, importance in zip(feature_names, importances):
            feature_importance[str(feature)] = float(importance)
        
        return {
            "success": True,
            "horizon": horizon,
            "feature_importance": feature_importance
        }
    except Exception as e:
        logger.error(f"Error getting feature importance: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e)
        }
    
__all__ = [
    'predict_product_sales', 
    'get_model_status', 
    'get_feature_importance',
    'prepare_features',  # Export this internal function
    'make_prediction'    # Export this internal function
]