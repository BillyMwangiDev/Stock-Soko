"""
Settings Router - User preferences and settings management
"""
from fastapi import APIRouter, HTTPException, Depends
from ..schemas.settings import UserSettings, UserPreferences, SecuritySettings
from ..utils.jwt import get_current_user

router = APIRouter(prefix="/settings", tags=["settings"])

# In-memory storage (use database in production)
user_settings_db = {}


@router.get("", response_model=UserSettings)
async def get_settings(current_user: dict = Depends(get_current_user)):
    """
    Get user settings and preferences
    
    Returns current user settings including preferences and security settings
    """
    user_email = current_user.get("email")
    
    # Return default settings if not found
    if user_email not in user_settings_db:
        return UserSettings(
            preferences=UserPreferences(),
            security=SecuritySettings()
        )
    
    return user_settings_db[user_email]


@router.put("", response_model=UserSettings)
async def update_settings(
    settings: UserSettings,
    current_user: dict = Depends(get_current_user)
):
    """
    Update user settings
    
    - **settings**: New settings to apply
    
    Returns updated settings
    """
    user_email = current_user.get("email")
    
    # Validate settings
    if settings.security.session_timeout_minutes < 5:
        raise HTTPException(
            status_code=400,
            detail="Session timeout must be at least 5 minutes"
        )
    
    if settings.security.session_timeout_minutes > 1440:
        raise HTTPException(
            status_code=400,
            detail="Session timeout cannot exceed 24 hours"
        )
    
    # Save settings
    user_settings_db[user_email] = settings
    
    return settings


@router.put("/preferences", response_model=UserPreferences)
async def update_preferences(
    preferences: UserPreferences,
    current_user: dict = Depends(get_current_user)
):
    """
    Update only user preferences
    
    - **preferences**: New preferences to apply
    """
    user_email = current_user.get("email")
    
    # Get existing settings or create new
    if user_email not in user_settings_db:
        user_settings_db[user_email] = UserSettings(
            preferences=preferences,
            security=SecuritySettings()
        )
    else:
        user_settings_db[user_email].preferences = preferences
    
    return preferences


@router.put("/security", response_model=SecuritySettings)
async def update_security(
    security: SecuritySettings,
    current_user: dict = Depends(get_current_user)
):
    """
    Update only security settings
    
    - **security**: New security settings to apply
    """
    user_email = current_user.get("email")
    
    # Validate
    if security.session_timeout_minutes < 5 or security.session_timeout_minutes > 1440:
        raise HTTPException(
            status_code=400,
            detail="Session timeout must be between 5 and 1440 minutes"
        )
    
    # Get existing settings or create new
    if user_email not in user_settings_db:
        user_settings_db[user_email] = UserSettings(
            preferences=UserPreferences(),
            security=security
        )
    else:
        user_settings_db[user_email].security = security
    
    return security


@router.post("/reset")
async def reset_settings(current_user: dict = Depends(get_current_user)):
    """
    Reset all settings to defaults
    
    Returns default settings
    """
    user_email = current_user.get("email")
    
    default_settings = UserSettings(
        preferences=UserPreferences(),
        security=SecuritySettings()
    )
    
    user_settings_db[user_email] = default_settings
    
    return {
        "message": "Settings reset to defaults",
        "settings": default_settings
    }

