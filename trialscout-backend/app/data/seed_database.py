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