from fastapi import APIRouter, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pathlib import Path

from app.database import connect_to_mongodb, close_mongodb_connection
from app.models import settings
from app.routers import (
    auth, barcode, users, inventory, sales, customers,
    categories, orders, predictions
)
from app.routers import settings as settings_router
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

debug_router = APIRouter()

app = FastAPI(
    title="Business Management API",
    description="Comprehensive business management backend",
    version="1.0.0"
)

# Configure CORS - Update to allow all origins in production since frontend and backend are on same origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-vercel-app-url.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    app.mongodb = await connect_to_mongodb()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongodb_connection()

# Root endpoint for basic health check
@app.get("/api/health")
async def health_check():
    return {
        "message": "Business Management API",
        "status": "healthy",
        "documentation": "/docs"
    }

# Register all API routers
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(sales.router, prefix="/api/sales", tags=["Sales"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
app.include_router(settings_router.router, prefix="/api/settings", tags=["Settings"])
app.include_router(barcode.router, prefix="/api/barcode", tags=["Barcode"])
app.include_router(debug_router, prefix="/api", tags=["Debug"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Predictions"])

# Check if static directory exists
static_dir = Path("static")
if static_dir.exists() and static_dir.is_dir():
    # Mount frontend static files
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")
    
    # Serve the frontend for all non-API routes
    @app.get("/{full_path:path}")
    async def serve_frontend(request: Request, full_path: str):
        # Skip API routes and docs
        if full_path.startswith("api/") or full_path == "docs" or full_path == "openapi.json":
            raise HTTPException(status_code=404, detail="Not found")
        
        # Serve index.html for all frontend routes to support client-side routing
        index_path = static_dir / "index.html"
        if index_path.exists():
            return FileResponse(index_path)
        
        raise HTTPException(status_code=404, detail="Frontend not built")
else:
    logger.warning("Static directory not found. Frontend will not be served.")

# Main entry point for Hugging Face Spaces
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)