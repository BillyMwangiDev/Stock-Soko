from pydantic import BaseModel, Field
from typing import Optional


class UserPreferences(BaseModel):
    notifications_enabled: bool = True
    email_alerts: bool = True
    sms_alerts: bool = False
    price_alerts_enabled: bool = True
    news_alerts_enabled: bool = True
    language: str = Field("en", description="en or sw (Swahili)")
    theme: str = Field("light", description="light or dark")
    currency: str = Field("KES", description="Display currency")
    
    class Config:
        json_schema_extra = {
            "example": {
                "notifications_enabled": True,
                "email_alerts": True,
                "sms_alerts": False,
                "price_alerts_enabled": True,
                "news_alerts_enabled": True,
                "language": "en",
                "theme": "light",
                "currency": "KES"
            }
        }


class SecuritySettings(BaseModel):
    two_factor_enabled: bool = False
    biometric_enabled: bool = False
    session_timeout_minutes: int = Field(30, ge=5, le=1440)
    
    class Config:
        json_schema_extra = {
            "example": {
                "two_factor_enabled": False,
                "biometric_enabled": False,
                "session_timeout_minutes": 30
            }
        }


class UserSettings(BaseModel):
    preferences: UserPreferences
    security: SecuritySettings
    
    class Config:
        json_schema_extra = {
            "example": {
                "preferences": {
                    "notifications_enabled": True,
                    "language": "en",
                    "theme": "light"
                },
                "security": {
                    "two_factor_enabled": False
                }
            }
        }