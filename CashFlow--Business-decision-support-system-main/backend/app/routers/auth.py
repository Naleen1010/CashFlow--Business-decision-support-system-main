from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models.business import BusinessCreate
from app.models.user import UserCreate, UserRole
from app.services.business_service import create_business
from app.services.user_service import create_user, authenticate_user
from app.auth.jwt_handler import create_access_token
from app.auth import get_current_user, get_current_admin_user
from app.database import get_db  # Import the database dependency

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_business(
    business: BusinessCreate,
    db = Depends(get_db)  # Add db dependency
):
    # Create business
    business_id = await create_business(business, db)
    if not business_id:
        raise HTTPException(status_code=400, detail="Failed to create business")
    
    # Create admin user
    admin_user = UserCreate(
        username=business.email,
        email=business.email,
        password=business.password,
        role=UserRole.ADMIN
    )
    
    # Create admin user with special flag
    try:
        user_id = await create_user(business_id, admin_user, is_admin_creation=True, db=db)
        if not user_id:
            raise HTTPException(status_code=400, detail="Failed to create admin user")
    except HTTPException as e:
        # If admin user creation fails, we should probably delete the business
        # Implementation of delete_business would be needed
        raise HTTPException(status_code=400, detail=str(e.detail))
    
    return {"message": "Business and admin user created successfully"}

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db = Depends(get_db)  # Add db dependency
):
    try:
        user = await authenticate_user(form_data.username, form_data.password, db)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token = create_access_token(data={"sub": str(user.id), "business": str(user.business_id), "role": user.role})
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        print(f"Login error: {e}")  # Debug print
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during login: {str(e)}"
        )