from app.models.user import UserCreate, UserUpdate, UserInDB, UserRole
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
from passlib.context import CryptContext
from app.models.base import PyObjectId
from typing import Optional, List, Union
from fastapi import HTTPException, status

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def get_users(business_id: str, db=None) -> List[dict]:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
        
    users = await db.users.find({"business_id": PyObjectId(business_id)}).to_list(None)
    
    # Convert users to a list of dicts with string IDs
    return [
        {
            **user,
            '_id': str(user['_id']),
            'business_id': str(user['business_id'])
        }
        for user in users
    ]


async def get_user(business_id: str, user_id: str, db=None) -> Optional[UserInDB]:
    try:
        # Use provided db or create a new connection
        if db is None:
            client = AsyncIOMotorClient(settings.MONGODB_URL)
            db = client[settings.MONGODB_NAME]
        
        # Convert string IDs to PyObjectId
        business_id_obj = PyObjectId(business_id)
        user_id_obj = PyObjectId(user_id)
        
        user = await db.users.find_one({
            "_id": user_id_obj,
            "business_id": business_id_obj
        })
        
        if user:
            # Convert MongoDB ObjectIds to PyObjectId before validation
            return UserInDB(
                id=PyObjectId(user['_id']),
                business_id=PyObjectId(user['business_id']),
                username=user['username'],
                email=user['email'],
                role=user['role'],
                hashed_password=user['hashed_password']
            )
        return None
        
    except Exception as e:
        print(f"Error in get_user: {e}")  # For debugging
        return None

async def get_user_by_email(email: str, db=None) -> Optional[UserInDB]:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
        
    user = await db.users.find_one({"email": email})
    if user:
        user['_id'] = PyObjectId(user['_id'])
        user['business_id'] = PyObjectId(user['business_id'])
        return UserInDB.model_validate(user)
    return None

async def get_user_by_username(username: str, db=None) -> Optional[UserInDB]:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
        
    user = await db.users.find_one({"username": username})
    if user:
        user['_id'] = PyObjectId(user['_id'])
        user['business_id'] = PyObjectId(user['business_id'])
        return UserInDB.model_validate(user)
    return None

async def create_user(business_id: str | PyObjectId, user: UserCreate, is_admin_creation: bool = False, db=None) -> Optional[str]:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    # Check if username or email already exists
    if await get_user_by_username(user.username, db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    if await get_user_by_email(user.email, db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Enforce regular user role unless it's admin creation
    if not is_admin_creation and user.role != UserRole.REGULAR:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only regular users can be created"
        )
    
    try:
        # Hash the password
        hashed_password = pwd_context.hash(user.password)
        
        # Generate new ID and convert business_id to PyObjectId
        user_id = PyObjectId()
        business_id_obj = (
            PyObjectId(business_id) if isinstance(business_id, str) 
            else PyObjectId(str(business_id))
        )
        
        # Create user document
        user_doc = {
            "_id": user_id,
            "business_id": business_id_obj,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "hashed_password": hashed_password
        }
        
        # Insert the user
        result = await db.users.insert_one(user_doc)
        return str(result.inserted_id)
        
    except Exception as e:
        print(f"Error in create_user: {e}")  # For debugging
        return None

async def update_user(business_id: str, user_id: str, user: UserUpdate, db=None) -> Optional[UserInDB]:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    # Check if user exists
    existing_user = await get_user(business_id, user_id, db)
    if not existing_user:
        return None
    
    # If username is being updated, check if it's already taken
    if user.username and user.username != existing_user.username:
        if await get_user_by_username(user.username, db):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # If email is being updated, check if it's already taken
    if user.email and user.email != existing_user.email:
        if await get_user_by_email(user.email, db):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    update_data = user.model_dump(exclude_unset=True)
    
    result = await db.users.update_one(
        {
            "_id": PyObjectId(user_id), 
            "business_id": PyObjectId(business_id)
        },
        {"$set": update_data}
    )
    
    if result.modified_count == 1:
        return await get_user(business_id, user_id, db)
    return None

async def delete_user(business_id: str, user_id: str, db=None) -> bool:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    # Don't allow deletion of admin users
    user = await get_user(business_id, user_id, db)
    if not user:
        return False
    
    if user.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete admin user"
        )
    
    result = await db.users.delete_one({
        "_id": PyObjectId(user_id), 
        "business_id": PyObjectId(business_id)
    })
    return result.deleted_count == 1

async def authenticate_user(username: str, password: str, db=None) -> Union[UserInDB, bool]:
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    print(f"Attempting to authenticate user: {username}")  # Debug print
    
    # Try to find user by username or email
    user = await db.users.find_one({
        "$or": [
            {"username": username},
            {"email": username}
        ]
    })
    
    if not user:
        print(f"No user found with username or email: {username}")  # Debug print
        return False
    
    # Verify password
    if not pwd_context.verify(password, user["hashed_password"]):
        print("Password verification failed")  # Debug print
        return False
    
    # Convert ObjectIds to PyObjectIds
    user['_id'] = PyObjectId(user['_id'])
    user['business_id'] = PyObjectId(user['business_id'])
    
    print("Authentication successful")  # Debug print
    return UserInDB.model_validate(user)

# Password management functions
async def change_user_password(business_id: str, user_id: str, current_password: str, new_password: str, db=None) -> bool:
    """
    Changes a user's password after verifying the current password.
    
    Args:
        business_id: The business ID
        user_id: The user ID
        current_password: The current password
        new_password: The new password
        db: Optional database connection
        
    Returns:
        True if password was changed successfully, False otherwise
    
    Raises:
        HTTPException: If current password is incorrect
    """
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    # Get the user
    user = await get_user(business_id, user_id, db)
    if not user:
        return False
        
    # Verify current password
    if not pwd_context.verify(current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
        
    # Hash the new password
    hashed_password = pwd_context.hash(new_password)
    
    # Update the password
    result = await db.users.update_one(
        {
            "_id": PyObjectId(user_id),
            "business_id": PyObjectId(business_id)
        },
        {"$set": {"hashed_password": hashed_password}}
    )
    
    return result.modified_count == 1

async def reset_user_password(business_id: str, user_id: str, new_password: str, db=None) -> bool:
    """
    Resets a user's password without verifying the current password.
    This is an admin function.
    
    Args:
        business_id: The business ID
        user_id: The user ID
        new_password: The new password
        db: Optional database connection
        
    Returns:
        True if password was reset successfully, False otherwise
    """
    # Use provided db or create a new connection
    if db is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_NAME]
    
    # Check if user exists
    user = await get_user(business_id, user_id, db)
    if not user:
        return False
        
    # Hash the new password
    hashed_password = pwd_context.hash(new_password)
    
    # Update the password
    result = await db.users.update_one(
        {
            "_id": PyObjectId(user_id),
            "business_id": PyObjectId(business_id)
        },
        {"$set": {"hashed_password": hashed_password}}
    )
    
    return result.modified_count == 1