import pandas as pd
import numpy as np
import os
import joblib
import logging
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from typing import Dict, List, Any, Optional
from app.services.sale_service import get_sales
from app.services.prediction_service import get_model_status, get_feature_importance

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create directory for saving models
MODEL_DIR = os.path.join(os.getcwd(), "models")
os.makedirs(MODEL_DIR, exist_ok=True)

async def train_models_for_business(business_id: str, force_retrain: bool = False, db = None) -> Dict[str, Any]:
    """
    End-to-end model training for a business
    
    Args:
        business_id: Business ID
        force_retrain: Whether to force retraining if models already exist
        db: Database connection
        
    Returns:
        Dictionary with training results
    """
    try:
        # Check if models already exist
        if not force_retrain:
            model_status = await get_model_status(business_id, db)
            if model_status.get("all_models_available", False):
                feature_importance = await get_feature_importance(business_id, 'daily', db)
                return {
                    "success": True,
                    "models": list(model_status.get("models", {}).keys()),
                    "error": None,
                    "data_points": None,
                    "feature_importance": feature_importance.get("feature_importance", {})
                }
        
        # Get sales data for training
        sales_data = await get_sales(business_id, db)
        
        if not sales_data or len(sales_data) < 10:  # Require at least 10 sales records
            return {"success": False, "error": "Not enough sales data for training"}
        
        # Convert sales data to list of dictionaries
        sales_data_dicts = [sale.model_dump() for sale in sales_data]
        
        # Prepare sales data
        sales_df = await prepare_sales_data(sales_data_dicts)
        
        if len(sales_df) == 0:
            return {"success": False, "error": "No valid sales data found after processing"}
        
        # Generate features
        feature_df = await generate_features(sales_df)
        
        # Train models
        model_paths = await train_models(business_id, feature_df)
        
        if not model_paths:
            return {"success": False, "error": "Failed to train models"}
        
        # Get feature importance
        feature_importance_result = await get_feature_importance(business_id, 'daily', db)
        
        return {
            "success": True,
            "models": list(model_paths.keys()),
            "feature_importance": feature_importance_result.get("feature_importance", {}),
            "data_points": len(sales_df),
            "features": list(feature_df.columns)
        }
        
    except Exception as e:
        logger.error(f"Error training models: {e}", exc_info=True)
        return {"success": False, "error": str(e)}

async def prepare_sales_data(sales_data: List[Dict]) -> pd.DataFrame:
    """
    Prepare sales data for model training
    
    Args:
        sales_data: List of sales documents
        
    Returns:
        DataFrame with flattened and processed sales data
    """
    logger.info("Preparing sales data for model training...")
    
    # Convert to DataFrame if it's not already
    if not isinstance(sales_data, pd.DataFrame):
        df = pd.DataFrame(sales_data)
    else:
        df = sales_data.copy()
    
    # Ensure timestamp is datetime
    if 'timestamp' in df.columns:
        df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Flatten the nested data structure
    flattened_data = []
    
    # Process each sale
    for _, row in df.iterrows():
        business_id = str(row.get('business_id', 'unknown'))
        sale_id = str(row.get('_id', 'unknown'))
        sale_date = row.get('timestamp', pd.Timestamp.now())
        status = row.get('status', 'unknown')
        
        # Get items from the sale
        items = row.get('items', [])
        
        # Process each item in the sale
        for item in items:
            category_name = item.get('category_name', 'Uncategorized')
            if pd.isna(category_name) or category_name == '':
                category_name = 'Uncategorized'
            
            # Convert ObjectIds to strings if needed
            product_id = str(item.get('product_id', 'unknown'))
            
            flattened_item = {
                'business_id': business_id,
                'sale_id': sale_id,
                'sale_date': sale_date,
                'status': status,
                'product_id': product_id,
                'product_name': item.get('product_name', 'Unknown Product'),
                'category_id': str(item.get('category_id', 'unknown')),
                'category_name': category_name,
                'category': category_name,
                'quantity': item.get('quantity', 0),
                'price': item.get('unit_price', 0),
                'total': item.get('subtotal', 0)
            }
            flattened_data.append(flattened_item)
    
    # Create DataFrame from flattened data
    sales_df = pd.DataFrame(flattened_data)
    
    # Handle missing values and data types
    sales_df['quantity'] = pd.to_numeric(sales_df['quantity'], errors='coerce').fillna(0)
    sales_df['price'] = pd.to_numeric(sales_df['price'], errors='coerce').fillna(0)
    sales_df['total'] = pd.to_numeric(sales_df['total'], errors='coerce').fillna(0)
    sales_df['category'] = sales_df['category'].fillna('Uncategorized')
    sales_df['product_name'] = sales_df['product_name'].fillna('Unknown Product')
    
    # Filter for completed sales (adjust this filter based on your actual status values)
    valid_statuses = ['completed', 'partial_refunded', 'COMPLETED', 'PARTIAL_REFUNDED']
    sales_df = sales_df[sales_df['status'].isin(valid_statuses)]
    
    logger.info(f"Prepared {len(sales_df)} flattened sales records")
    logger.info(f"Unique products: {sales_df['product_id'].nunique()}")
    logger.info(f"Unique categories: {sales_df['category'].nunique()}")
    
    return sales_df

async def generate_features(sales_df: pd.DataFrame) -> pd.DataFrame:
    """
    Generate features for model training from prepared sales data
    
    Args:
        sales_df: DataFrame with prepared sales data
        
    Returns:
        DataFrame with features for model training
    """
    logger.info("Generating features for model training...")
    
    # Create a daily aggregated dataset
    daily_sales_by_product = sales_df.groupby(["sale_date", "product_id"]).agg({
        "quantity": "sum",
        "total": "sum",
        "product_name": "first",
        "category": "first"
    }).reset_index()
    
    # Create a complete date range
    date_range = pd.date_range(
        start=sales_df["sale_date"].min(),
        end=sales_df["sale_date"].max(),
        freq="D"
    )
    
    # Get all unique products
    all_products = sales_df["product_id"].unique()
    logger.info(f"Found {len(all_products)} unique products in sales data")
    
    # Create reference dataset with all date-product combinations
    date_product_combinations = []
    for date in date_range:
        for product in all_products:
            date_product_combinations.append((date, product))
    
    reference_df = pd.DataFrame(
        date_product_combinations,
        columns=["sale_date", "product_id"]
    )
    
    # Merge actual sales data with reference dataset
    merged_df = pd.merge(
        reference_df,
        daily_sales_by_product,
        on=["sale_date", "product_id"],
        how="left"
    )
    
    # Fill missing values
    merged_df["quantity"] = merged_df["quantity"].fillna(0)
    merged_df["total"] = merged_df["total"].fillna(0)
    merged_df['category'] = merged_df['category'].fillna('Uncategorized')
    merged_df['product_name'] = merged_df['product_name'].fillna('Unknown Product')
    
    # Create datetime features
    merged_df["year"] = merged_df["sale_date"].dt.year
    merged_df["month"] = merged_df["sale_date"].dt.month
    merged_df["day"] = merged_df["sale_date"].dt.day
    merged_df["dayofweek"] = merged_df["sale_date"].dt.dayofweek
    merged_df["quarter"] = merged_df["sale_date"].dt.quarter
    merged_df["is_month_start"] = merged_df["sale_date"].dt.is_month_start.astype(int)
    merged_df["is_month_end"] = merged_df["sale_date"].dt.is_month_end.astype(int)
    merged_df["is_weekend"] = merged_df["dayofweek"].isin([5, 6]).astype(int)
    
    # Create rolling window features for temporal patterns
    grouped = merged_df.sort_values("sale_date").groupby("product_id")
    
    # Rolling window aggregations
    merged_df["sales_last_7_days"] = grouped["total"].transform(
        lambda x: x.rolling(window=7, min_periods=1).sum().shift(1)
    )
    
    merged_df["sales_last_30_days"] = grouped["total"].transform(
        lambda x: x.rolling(window=30, min_periods=1).sum().shift(1)
    )
    
    merged_df["quantity_last_7_days"] = grouped["quantity"].transform(
        lambda x: x.rolling(window=7, min_periods=1).sum().shift(1)
    )
    
    merged_df["quantity_last_30_days"] = grouped["quantity"].transform(
        lambda x: x.rolling(window=30, min_periods=1).sum().shift(1)
    )
    
    # Calculate days since last sale
    merged_df["days_since_last_sale"] = 999  # Default value
    
    for name, group in grouped:
        # Create a mask for days with sales
        sales_mask = group["quantity"] > 0
        
        # Get dates with sales
        sales_dates = group.loc[sales_mask, "sale_date"].sort_values()
        
        if len(sales_dates) == 0:
            # No sales for this product
            continue
        
        # Process each row in the group
        for idx, row in group.iterrows():
            current_date = row["sale_date"]
            
            if row["quantity"] > 0:
                # This is a sale day
                merged_df.at[idx, "days_since_last_sale"] = 0
            else:
                # Find previous sales dates
                prev_sales = sales_dates[sales_dates < current_date]
                
                if len(prev_sales) > 0:
                    # Calculate days since most recent sale
                    latest_sale = prev_sales.iloc[-1]
                    days_diff = (current_date - latest_sale).days
                    merged_df.at[idx, "days_since_last_sale"] = min(days_diff, 365)
    
    # Calculate sales trend
    merged_df["sales_trend"] = 0.0
    
    valid_mask = merged_df["sales_last_30_days"] > 0
    if valid_mask.any():
        merged_df.loc[valid_mask, "sales_trend"] = (
            (merged_df.loc[valid_mask, "sales_last_7_days"] * (30/7) -
            merged_df.loc[valid_mask, "sales_last_30_days"]) /
            merged_df.loc[valid_mask, "sales_last_30_days"]
        )
    
    # Lag features - previous day, previous week same day
    merged_df["prev_day_quantity"] = grouped["quantity"].shift(1)
    merged_df["prev_week_quantity"] = grouped["quantity"].shift(7)
    
    # Create target columns for different prediction horizons
    merged_df["weekly_quantity"] = grouped["quantity"].transform(
        lambda x: x.rolling(window=7, min_periods=1).sum().shift(-6)
    )
    
    merged_df["monthly_quantity"] = grouped["quantity"].transform(
        lambda x: x.rolling(window=30, min_periods=1).sum().shift(-29)
    )
    
    # Store date for reference but convert datetime to date for training
    merged_df["date"] = merged_df["sale_date"].dt.date
    merged_df = merged_df.drop(columns=['sale_date'])  # Remove timestamp object
    
    # Check for any remaining NaN values
    if merged_df.isnull().any().any():
        logger.warning("Data contains NaN values. Filling with zeros.")
        merged_df = merged_df.fillna(0)
    
    # Replace infinities with zeros
    merged_df = merged_df.replace([np.inf, -np.inf], 0)
    
    logger.info(f"Generated features with shape: {merged_df.shape}")
    
    return merged_df

async def train_models(business_id: str, data: pd.DataFrame) -> Dict[str, str]:
    """
    Train models for daily, weekly, and monthly predictions
    
    Args:
        business_id: Business ID
        data: DataFrame with features
        
    Returns:
        Dictionary with model paths
    """
    logger.info(f"Training models for business {business_id}...")
    
    # Make sure these features exist in the dataframe
    available_columns = data.columns.tolist()
    desired_features = [
        "year", "month", "day", "dayofweek", "quarter",
        "is_month_start", "is_month_end", "is_weekend",
        "sales_last_7_days", "sales_last_30_days",
        "quantity_last_7_days", "quantity_last_30_days",
        "days_since_last_sale", "sales_trend",
        "prev_day_quantity", "prev_week_quantity"
    ]
    
    # Filter to only include features that exist in the dataframe
    features = [col for col in desired_features if col in available_columns]
    logger.info(f"Using these numerical features: {features}")
    
    # Check if the categorical feature exists
    if "category" in available_columns:
        categorical_features = ["category"]
    else:
        logger.warning("'category' column not found, using no categorical features")
        categorical_features = []
    
    # Create time-based train-test split
    data = data.sort_values('date')
    test_size = 0.2
    split_idx = int(len(data) * (1 - test_size))
    
    train_data = data.iloc[:split_idx].copy()
    test_data = data.iloc[split_idx:].copy()
    
    logger.info(f"Train set: {len(train_data)} samples")
    logger.info(f"Test set: {len(test_data)} samples")
    
    # Set up preprocessing pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), features)
        ],
        remainder='drop'
    )
    
    # Add categorical features if they exist
    if categorical_features:
        preprocessor.transformers.append(
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        )
    
    # Define X and y for training
    X_train = train_data[features + categorical_features]
    X_test = test_data[features + categorical_features]
    
    # Models to train
    models_to_train = {
        'daily': {'target': 'quantity', 'model_type': GradientBoostingRegressor(n_estimators=100, random_state=42)},
        'weekly': {'target': 'weekly_quantity', 'model_type': GradientBoostingRegressor(n_estimators=100, random_state=42)},
        'monthly': {'target': 'monthly_quantity', 'model_type': GradientBoostingRegressor(n_estimators=100, random_state=42)}
    }
    
    # Train models for each horizon
    model_paths = {}
    
    for model_name, config in models_to_train.items():
        logger.info(f"Training {model_name} model...")
        target = config['target']
        
        # Ensure target exists
        if target not in train_data.columns:
            logger.warning(f"Target column {target} not found in training data")
            continue
            
        # Define y for this target
        y_train = train_data[target]
        y_test = test_data[target]
        
        # Create pipeline
        pipeline = Pipeline([
            ('preprocessor', preprocessor),
            ('regressor', config['model_type'])
        ])
        
        # Train model
        pipeline.fit(X_train, y_train)
        
        # Evaluate model
        train_preds = pipeline.predict(X_train)
        test_preds = pipeline.predict(X_test)
        
        train_mae = mean_absolute_error(y_train, train_preds)
        test_mae = mean_absolute_error(y_test, test_preds)
        train_rmse = np.sqrt(mean_squared_error(y_train, train_preds))
        test_rmse = np.sqrt(mean_squared_error(y_test, test_preds))
        
        logger.info(f"  Train metrics - MAE: {train_mae:.4f}, RMSE: {train_rmse:.4f}")
        logger.info(f"  Test metrics - MAE: {test_mae:.4f}, RMSE: {test_rmse:.4f}")
        
        # Save model
        model_path = os.path.join(MODEL_DIR, f"{business_id}_{model_name}_model.pkl")
        joblib.dump(pipeline, model_path)
        logger.info(f"  Model saved to {model_path}")
        
        model_paths[model_name] = model_path
    
    return model_paths