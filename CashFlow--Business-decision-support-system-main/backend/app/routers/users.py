from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import PasswordChange, PasswordReset, UserCreate, UserModel, UserRole, UserUpdate, UserInDB
from app.services.user_service import change_user_password, get_users, get_user, create_user, reset_user_password, update_user, delete_user
from app.auth import get_current_user, get_current_admin_user
from typing import List
from app.database import get_db  # Import the database dependency

router = APIRouter()

# IMPORTANT: Specific routes must come BEFORE wildcard routes
# Me routes
@router.get("/me", response_model=UserModel)
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    """Get the current user's profile"""
    return current_user

@router.put("/me", response_model=UserInDB)
async def update_current_user(
    user_update: UserUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)  # Add db dependency
):
    """
    Update the current user's own profile.
    Users can only update username and email.
    """
    # Print debug info
    print(f"Updating user: {current_user.id} (business: {current_user.business_id})")
    
    # Ensure users can't change their role
    if user_update.role is not None and user_update.role != current_user.role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot change your own role"
        )
    
    # Admin users might need special handling
    if current_user.role == UserRole.ADMIN and user_update.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin users cannot downgrade their role"
        )
    
    updated_user = await update_user(
        str(current_user.business_id), 
        str(current_user.id), 
        user_update,
        db
    )
    
    if updated_user is None:
        print(f"User not found during update: {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return updated_user

# Password management routes
@router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    password_data: PasswordChange,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)  # Add db dependency
):
    """
    Change the current user's password.
    Requires current password for verification.
    """
    success = await change_user_password(
        str(current_user.business_id),
        str(current_user.id),
        password_data.current_password,
        password_data.new_password,
        db
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to change password"
        )
    
    return {"message": "Password changed successfully"}

# Collection routes (no path parameters)
@router.get("", response_model=List[UserInDB])
async def read_users(
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)  # Add db dependency
):
    """Get all users for the current business"""
    users = await get_users(str(current_user.business_id), db)
    return users

@router.post("", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
async def create_new_user(
    user: UserCreate,
    current_user: UserInDB = Depends(get_current_admin_user),
    db = Depends(get_db)  # Add db dependency
):
    """Create a new user (admin only)"""
    try:
        # Create the user and get the ID
        user_id = await create_user(str(current_user.business_id), user, db=db)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user"
            )
        
        # Fetch and return the created user
        created_user = await get_user(str(current_user.business_id), user_id, db)
        if not created_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User created but failed to fetch details"
            )
        
        return created_user
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while creating user: {str(e)}"
        )

# IMPORTANT: Password reset route needs to come before the general user_id route
@router.put("/{user_id}/password", status_code=status.HTTP_200_OK)
async def reset_password(
    user_id: str,
    password_data: PasswordReset,
    current_user: UserInDB = Depends(get_current_admin_user),
    db = Depends(get_db)  # Add db dependency
):
    """
    Reset another user's password. Admin only.
    Does not require the current password.
    """
    # Make sure admins can't change other admin passwords
    target_user = await get_user(str(current_user.business_id), user_id, db)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Only allow admins to reset regular user passwords
    if target_user.role == UserRole.ADMIN and str(target_user.id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot reset another admin's password"
        )
    
    success = await reset_user_password(
        str(current_user.business_id),
        user_id,
        password_data.password,
        db
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to reset password"
        )
    
    return {"message": "Password reset successfully"}

# User CRUD operations with user_id parameter
@router.get("/{user_id}", response_model=UserInDB)
async def read_user(
    user_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db)  # Add db dependency
):
    """Get a specific user by ID"""
    user = await get_user(str(current_user.business_id), user_id, db)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserInDB)
async def update_existing_user(
    user_id: str,
    user: UserUpdate,
    current_user: UserInDB = Depends(get_current_admin_user),
    db = Depends(get_db)  # Add db dependency
):
    """Update a user (admin only)"""
    updated_user = await update_user(str(current_user.business_id), user_id, user, db)
    if updated_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_user(
    user_id: str,
    current_user: UserInDB = Depends(get_current_admin_user),
    db = Depends(get_db)  # Add db dependency
):
    """Delete a user (admin only)"""
    if not await delete_user(str(current_user.business_id), user_id, db):
        raise HTTPException(status_code=404, detail="User not found")