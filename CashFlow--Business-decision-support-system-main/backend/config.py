import os
import logging
from pydantic_settings import BaseSettings
from pydantic import ConfigDict, validator
from dotenv import load_dotenv

# Load .env file explicitly
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    # MongoDB Atlas connection string (default is a placeholder)
    MONGODB_URL: str = "mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority"
    MONGODB_NAME: str = "business_management"
    
    # Auth settings
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Environment configuration
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )
    
    @validator('MONGODB_URL')
    def validate_mongodb_url(cls, v):
        """Validate that the MongoDB URL is properly formatted"""
        if not v.startswith(('mongodb://', 'mongodb+srv://')):
            raise ValueError("MONGODB_URL must start with 'mongodb://' or 'mongodb+srv://'")
        return v
    
    def __init__(self, **data):
        super().__init__(**data)
        # # Debug printing
        # print(f"Loaded MONGODB_URL: {self.MONGODB_URL}")
        # print(f"Is this an Atlas URL? {'Yes' if 'mongodb+srv' in self.MONGODB_URL else 'No'}")
        # # Log MongoDB connection (with password redacted for security)
        self._log_connection_info()
    
    def _log_connection_info(self):
        """Log MongoDB connection details with redacted password"""
        redacted_url = self.MONGODB_URL
        
        # Redact password from log output for security
        if '@' in redacted_url:
            # Split URL into parts before and after the @ symbol
            prefix, suffix = redacted_url.split('@', 1)
            
            # Check if there's a password in the URL
            if ':' in prefix and '/' not in prefix.split(':', 1)[1]:
                # Get username part and replace password with ****
                username_part = prefix.split(':')[0]
                redacted_url = f"{username_part}:****@{suffix}"
        
        logger.info(f"MongoDB Connection: {redacted_url}")
        logger.info(f"MongoDB Database: {self.MONGODB_NAME}")
        
        # Hint about Atlas connection
        if 'mongodb+srv' in self.MONGODB_URL:
            logger.info("Using MongoDB Atlas cloud database")
        else:
            logger.warning("Using local MongoDB instance - consider migrating to Atlas for production")

# Create the settings instance
settings = Settings()