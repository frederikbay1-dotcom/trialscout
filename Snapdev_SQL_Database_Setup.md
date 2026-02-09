# Snapdev Prompt: Fix SQL Database Setup and Integrate with Backend

## Context
Backend is currently using in-memory trial storage. We need to:
1. Fix the SQLAlchemy setup (deprecated import)
2. Create SQL models for trials
3. Set up database migrations with Alembic
4. Update API endpoints to use database instead of in-memory list

## Objective
Complete SQL database integration with SQLite (dev) and PostgreSQL-ready (production).

---

## Instructions for Snapdev

@workspace Set up SQL database with proper models and migrations for clinical trial storage.

### Step 1: Fix Database.py Deprecated Import

**File:** `app/database.py`

**Change line 3 from:**
```python
from sqlalchemy.ext.declarative import declarative_base  # ⚠️ Deprecated
```

**To:**
```python
from sqlalchemy.orm import declarative_base  # ✓ Current
```

**Also add connection pooling (lines 9-10):**
```python
# OLD:
engine = create_engine(settings.database_url, connect_args=connect_args)

# NEW:
engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    pool_pre_ping=True,  # Check connection health before using
    pool_size=5,          # Connection pool size
    max_overflow=10       # Max connections above pool_size
)
```

### Step 2: Update Config to Include Database URL

**File:** `app/config.py`

Add database URL to settings:

```python
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Existing settings...
    
    # Database
    database_url: str = "sqlite:///./trialscout.db"  # Default to SQLite
    
    # For PostgreSQL in production, use:
    # database_url: str = "postgresql://user:password@localhost/trialscout"
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### Step 3: Create SQL Models

**File:** `app/models/trial_db.py` (NEW FILE)

```python
"""SQLAlchemy models for clinical trials"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.database import Base


class TrialDB(Base):
    """Database model for clinical trials"""
    __tablename__ = "trials"
    
    # Primary key
    id = Column(String, primary_key=True)  # e.g., "bc_trial_001"
    
    # Core trial information
    nct_number = Column(String, unique=True, nullable=False, index=True)
    title = Column(Text, nullable=False)
    phase = Column(String, nullable=False)  # e.g., "Phase III"
    sponsor = Column(String, nullable=False)
    status = Column(String, nullable=False)  # e.g., "recruiting"
    
    # Location and distance
    location = Column(String, nullable=False)
    distance = Column(Integer, nullable=False)  # Miles from patient
    
    # Cancer type
    cancer_type = Column(String, nullable=False, index=True)  # "breast" or "lung"
    
    # Dates
    last_updated = Column(String, nullable=False)  # ISO date string
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Matching metadata (from mock data)
    eligibility_score = Column(String, nullable=False)  # "possibly_eligible" or "likely_not_eligible"
    match_confidence = Column(String, nullable=False)  # "high", "medium", "low"
    
    # Complex nested data stored as JSON
    why_matched = Column(JSON, nullable=False)  # List[str]
    what_to_confirm = Column(JSON, nullable=False)  # List[str]
    eligibility_criteria = Column(JSON, nullable=False)  # List[dict]
    burden = Column(JSON, nullable=False)  # dict
    exclusion_risks = Column(JSON, nullable=False)  # dict
    translated_info = Column(JSON, nullable=False)  # dict
    
    def __repr__(self):
        return f"<Trial(nct='{self.nct_number}', title='{self.title[:50]}...')>"
    
    def to_dict(self):
        """Convert to dictionary matching TrialFullDetail schema"""
        return {
            "id": self.id,
            "nct_number": self.nct_number,
            "title": self.title,
            "phase": self.phase,
            "sponsor": self.sponsor,
            "status": self.status,
            "location": self.location,
            "distance": self.distance,
            "cancer_type": self.cancer_type,
            "last_updated": self.last_updated,
            "eligibility_score": self.eligibility_score,
            "match_confidence": self.match_confidence,
            "why_matched": self.why_matched,
            "what_to_confirm": self.what_to_confirm,
            "eligibility_criteria": self.eligibility_criteria,
            "burden": self.burden,
            "exclusion_risks": self.exclusion_risks,
            "translated_info": self.translated_info
        }
```

### Step 4: Install Alembic for Migrations

**Add to `requirements.txt`:**
```txt
alembic==1.13.1
```

**Initialize Alembic:**
```bash
cd trialscout-backend
alembic init alembic
```

### Step 5: Configure Alembic

**File:** `alembic/env.py`

**Find the line that says:**
```python
target_metadata = None
```

**Replace with:**
```python
from app.database import Base
from app.models.trial_db import TrialDB  # Import all models
target_metadata = Base.metadata
```

**Also find:**
```python
def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
```

**Replace with:**
```python
def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    from app.config import settings
    url = settings.database_url
```

**And find:**
```python
def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
```

**Replace with:**
```python
def run_migrations_online():
    """Run migrations in 'online' mode."""
    from app.config import settings
    from sqlalchemy import engine_from_config, pool
    
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = settings.database_url
    
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
```

**File:** `alembic.ini`

**Find:**
```ini
sqlalchemy.url = driver://user:pass@localhost/dbname
```

**Replace with:**
```ini
# sqlalchemy.url is set from app.config.settings.database_url
# This line is not used, but Alembic requires it to exist
sqlalchemy.url = 
```

### Step 6: Create Initial Migration

```bash
# Create migration for trials table
alembic revision --autogenerate -m "Create trials table"

# Apply migration
alembic upgrade head
```

### Step 7: Create Database Seed Script

**File:** `app/data/seed_database.py` (NEW FILE)

```python
"""
Script to seed database with initial trial data from mock_trials.py
Run with: python -m app.data.seed_database
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.database import SessionLocal, engine, Base
from app.models.trial_db import TrialDB
from app.data.mock_trials import TRIALS
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def seed_trials():
    """Seed database with trials from mock_trials.py"""
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Create session
    db = SessionLocal()
    
    try:
        # Clear existing trials (optional - remove if you want to keep existing data)
        existing_count = db.query(TrialDB).count()
        if existing_count > 0:
            logger.info(f"Found {existing_count} existing trials. Clearing...")
            db.query(TrialDB).delete()
            db.commit()
        
        # Insert trials
        created_count = 0
        updated_count = 0
        
        for trial in TRIALS:
            # Convert Trial object to dict
            trial_dict = trial.model_dump() if hasattr(trial, 'model_dump') else trial.dict()
            
            # Check if trial already exists
            existing = db.query(TrialDB).filter(TrialDB.nct_number == trial_dict["nct_number"]).first()
            
            if existing:
                # Update existing trial
                for key, value in trial_dict.items():
                    setattr(existing, key, value)
                updated_count += 1
                logger.info(f"Updated: {trial_dict['nct_number']}")
            else:
                # Create new trial
                db_trial = TrialDB(**trial_dict)
                db.add(db_trial)
                created_count += 1
                logger.info(f"Created: {trial_dict['nct_number']}")
        
        # Commit all changes
        db.commit()
        
        logger.info(f"\n✓ Database seeded successfully!")
        logger.info(f"  Created: {created_count} trials")
        logger.info(f"  Updated: {updated_count} trials")
        logger.info(f"  Total: {created_count + updated_count} trials in database")
        
        # Verify counts by cancer type
        breast_count = db.query(TrialDB).filter(TrialDB.cancer_type == "breast").count()
        lung_count = db.query(TrialDB).filter(TrialDB.cancer_type == "lung").count()
        logger.info(f"\n  Breast cancer trials: {breast_count}")
        logger.info(f"  Lung cancer trials: {lung_count}")
        
    except Exception as e:
        logger.error(f"✗ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    logger.info("Starting database seed...")
    seed_trials()
```

### Step 8: Update API Endpoints to Use Database

**File:** `app/api/trials.py`

**Replace in-memory TRIALS list with database queries:**

```python
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.trial_db import TrialDB
from app.schemas import TrialFullDetail
from fastapi import Depends

# REMOVE this line:
# from app.data.mock_trials import TRIALS

@app.get("/api/v1/trials")
async def get_trials(
    cancer_type: Optional[str] = None,
    phase: Optional[str] = None,
    limit: int = 100,
    skip: int = 0,
    db: Session = Depends(get_db)  # ← Add database dependency
):
    """Get all trials with optional filtering"""
    
    # Build query
    query = db.query(TrialDB)
    
    # Apply filters
    if cancer_type:
        query = query.filter(TrialDB.cancer_type == cancer_type)
    if phase:
        query = query.filter(TrialDB.phase == phase)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    trials = query.offset(skip).limit(limit).all()
    
    # Convert to schema
    trial_dicts = [trial.to_dict() for trial in trials]
    
    return {
        "trials": trial_dicts,
        "total": total,
        "limit": limit,
        "skip": skip
    }


@app.get("/api/v1/trials/{nct_number}")
async def get_trial(
    nct_number: str,
    db: Session = Depends(get_db)
):
    """Get single trial by NCT number"""
    
    trial = db.query(TrialDB).filter(TrialDB.nct_number == nct_number).first()
    
    if not trial:
        raise HTTPException(status_code=404, detail="Trial not found")
    
    return {"trial": trial.to_dict()}


@app.post("/api/v1/trials")
async def create_trial(
    trial: TrialFullDetail,
    db: Session = Depends(get_db)
):
    """Create new trial"""
    
    # Check for duplicate NCT number
    existing = db.query(TrialDB).filter(TrialDB.nct_number == trial.nct_number).first()
    if existing:
        raise HTTPException(status_code=409, detail="Trial with this NCT number already exists")
    
    # Convert to dict and create DB model
    trial_dict = trial.model_dump()
    db_trial = TrialDB(**trial_dict)
    
    # Add to database
    db.add(db_trial)
    db.commit()
    db.refresh(db_trial)
    
    return {"trial": db_trial.to_dict(), "message": "Trial created successfully"}


@app.put("/api/v1/trials/{nct_number}")
async def update_trial(
    nct_number: str,
    trial: TrialFullDetail,
    db: Session = Depends(get_db)
):
    """Update existing trial"""
    
    db_trial = db.query(TrialDB).filter(TrialDB.nct_number == nct_number).first()
    
    if not db_trial:
        raise HTTPException(status_code=404, detail="Trial not found")
    
    # Update fields
    trial_dict = trial.model_dump()
    for key, value in trial_dict.items():
        setattr(db_trial, key, value)
    
    db.commit()
    db.refresh(db_trial)
    
    return {"trial": db_trial.to_dict(), "message": "Trial updated successfully"}


@app.delete("/api/v1/trials/{nct_number}")
async def delete_trial(
    nct_number: str,
    db: Session = Depends(get_db)
):
    """Delete trial"""
    
    db_trial = db.query(TrialDB).filter(TrialDB.nct_number == nct_number).first()
    
    if not db_trial:
        raise HTTPException(status_code=404, detail="Trial not found")
    
    db.delete(db_trial)
    db.commit()
    
    return {"message": "Trial deleted successfully"}


@app.post("/api/v1/match")
async def match_trials(
    patient: PatientProfile,
    db: Session = Depends(get_db)  # ← Add database dependency
):
    """Match patient to trials"""
    
    # Get all trials from database (not in-memory list)
    query = db.query(TrialDB).filter(TrialDB.cancer_type == patient.cancer_type)
    db_trials = query.all()
    
    # Convert to TrialFullDetail objects for matching engine
    trials = [TrialFullDetail(**trial.to_dict()) for trial in db_trials]
    
    # Run matching engine (existing logic)
    matching_engine = MatchingEngine()
    matched_trials = matching_engine.match_trials(patient, trials)
    
    # Return results
    return {
        "matches": matched_trials,
        "stats": {
            "total_trials": len(trials),
            "possibly_eligible": sum(1 for m in matched_trials if m.trial.eligibility_score == "possibly_eligible"),
            "likely_not_eligible": sum(1 for m in matched_trials if m.trial.eligibility_score == "likely_not_eligible")
        }
    }
```

### Step 9: Add Database Initialization to Main

**File:** `main.py`

**Add at the top:**
```python
from app.database import engine, Base
from app.models.trial_db import TrialDB  # Import to register model

# Create tables on startup (for development)
Base.metadata.create_all(bind=engine)
```

### Step 10: Run Database Setup

After Snapdev implements all changes:

```bash
# 1. Install Alembic
pip install alembic==1.13.1

# 2. Create migration
alembic revision --autogenerate -m "Create trials table"

# 3. Apply migration
alembic upgrade head

# 4. Seed database with 20 trials
python -m app.data.seed_database

# 5. Verify database
sqlite3 trialscout.db "SELECT COUNT(*) FROM trials;"
# Should show: 20

# 6. Verify by cancer type
sqlite3 trialscout.db "SELECT cancer_type, COUNT(*) FROM trials GROUP BY cancer_type;"
# Should show: breast=10, lung=10

# 7. Start server
uvicorn main:app --reload

# 8. Test API
curl http://localhost:8000/api/v1/trials | jq '.total'
# Should return: 20
```

---

## Summary of Changes

### Files Created:
1. ✅ `app/models/trial_db.py` - SQLAlchemy trial model
2. ✅ `app/data/seed_database.py` - Database seeding script
3. ✅ `alembic/` - Migration directory (via `alembic init`)

### Files Modified:
1. ✅ `app/database.py` - Fix deprecated import, add connection pooling
2. ✅ `app/config.py` - Add database_url setting
3. ✅ `app/api/trials.py` - Replace in-memory list with database queries
4. ✅ `main.py` - Add database initialization
5. ✅ `alembic/env.py` - Configure migrations
6. ✅ `requirements.txt` - Add alembic

### Benefits:
- ✅ Data persists across server restarts
- ✅ CRUD operations save to database
- ✅ Ready for PostgreSQL in production
- ✅ Proper migrations with Alembic
- ✅ Easy to add more trials via API or bulk upload

### Production Deployment:
When ready for production, just change `.env`:
```env
DATABASE_URL=postgresql://user:password@host:5432/trialscout
```

All code will work without changes!

---

## Troubleshooting

**If SQLite errors:**
- Delete `trialscout.db` and run migrations again
- Check file permissions

**If Alembic errors:**
- Ensure all models are imported in `alembic/env.py`
- Run `alembic stamp head` to reset

**If seed script fails:**
- Check that `mock_trials.py` exists and has TRIALS list
- Verify Trial objects have `model_dump()` or `dict()` method

---

**Implementation Time:** 45-60 minutes

**START IMPLEMENTATION**

Please implement these database changes and report back with results.
