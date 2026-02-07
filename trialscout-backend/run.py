"""
Quick start script for TrialScout backend
"""

import uvicorn
from app.main import app

if __name__ == "__main__":
    print("Starting TrialScout Backend API...")
    print("API Documentation: http://localhost:8000/docs")
    print("ReDoc: http://localhost:8000/redoc")
    print("Health Check: http://localhost:8000/api/health")
    print("\nPress CTRL+C to stop the server\n")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )