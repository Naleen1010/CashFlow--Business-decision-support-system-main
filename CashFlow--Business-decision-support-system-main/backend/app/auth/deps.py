from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.models.user import UserInDB, UserRole
from app.services.user_service import get_user
from .jwt_handler import decode_access_token

# Update the tokenUrl to include the prefix
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = decode_access_token(token)
        if not payload:
            raise credentials_exception
            
        user_id: str = payload.get("sub")
        business_id: str = payload.get("business")
        
        print(f"Token payload: user_id={user_id}, business_id={business_id}")  # Add this line
        
        if user_id is None or business_id is None:
            raise credentials_exception
        
        user = await get_user(business_id, user_id)
        
        # Add more detailed logging
        if user is None:
            print(f"User not found in database: user_id={user_id}, business_id={business_id}")
            raise credentials_exception
        
        return user
    except Exception as e:
        print(f"Error in get_current_user: {e}")
        raise credentials_exception

async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    return current_user

async def get_current_admin_user(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user