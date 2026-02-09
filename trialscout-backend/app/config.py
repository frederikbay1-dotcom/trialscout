from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # Database - Default to SQLite for development
    database_url: str = "sqlite:///./trialscout.db"
    # For PostgreSQL in production, use:
    # database_url: str = "postgresql://user:password@localhost:5432/trialscout"
    
    # API settings
    allowed_origins: str = "*"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_debug: bool = True
    
    # Other settings
    cors_origins: List[str] = ["*"]  # Allow all origins for development
    rate_limit_per_hour: int = 100
    dataset_version: str = "1.0"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()