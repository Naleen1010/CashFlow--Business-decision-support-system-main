from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import logging

logger = logging.getLogger(__name__)

# Database connection container
mongodb_client = None
mongodb = None

# Database dependency that can be used in routes
async def get_db():
    return mongodb

# Connection setup function
async def connect_to_mongodb():
    global mongodb_client, mongodb
    
    # Connection options for better reliability with Atlas
    conn_opts = {
        "serverSelectionTimeoutMS": 5000,  # 5 seconds timeout for server selection
        "connectTimeoutMS": 10000,         # 10 seconds timeout for connection
        "socketTimeoutMS": 45000,          # 45 seconds timeout for socket operations
        "maxPoolSize": 20,                 # Maximum connection pool size
        "minPoolSize": 1,                  # Minimum connection pool size
        "maxIdleTimeMS": 60000,            # Maximum idle time for a connection
        "retryWrites": True,               # Retry writes if they fail
        "w": "majority"                    # Write concern for durability
    }
    
    # Connect to MongoDB Atlas
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}")
    mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL, **conn_opts)
    mongodb = mongodb_client[settings.MONGODB_NAME]
    
    try:
        # Verify connection
        info = await mongodb.command("serverStatus")
        connection_info = f"Connected to MongoDB: {info.get('host', 'unknown')} (version {info.get('version', 'unknown')})"
        logger.info(connection_info)
        
        # Print database stats
        count_businesses = await mongodb.businesses.count_documents({})
        count_inventory = await mongodb.inventory.count_documents({})
        count_users = await mongodb.users.count_documents({})
        logger.info(f"Database stats: {count_businesses} businesses, {count_inventory} inventory items, {count_users} users")
    except Exception as e:
        logger.error(f"⚠️ Database connection verification error: {str(e)}")
    
    return mongodb

# Disconnect function
async def close_mongodb_connection():
    global mongodb_client
    if mongodb_client:
        mongodb_client.close()
        logger.info("MongoDB connection closed")