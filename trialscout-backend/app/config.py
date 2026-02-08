from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    database_url: str = "postgresql://user:password@localhost:5432/trialscout"
    cors_origins: List[str] = ["*"]  # Allow all origins for development
    rate_limit_per_hour: int = 100
    dataset_version: str = "1.0"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()