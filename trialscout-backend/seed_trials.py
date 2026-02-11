"""Seed database with trials from mock_trials.py"""
from app.database import SessionLocal
from app.models.trial_db import TrialDB
from app.data.mock_trials import TRIALS

def seed_database():
    """Seed database with all trials"""
    db = SessionLocal()
    
    try:
        # Clear existing trials
        db.query(TrialDB).delete()
        
        # Add all trials
        for trial in TRIALS:
            trial_dict = trial.model_dump()
            db_trial = TrialDB(**trial_dict)
            db.add(db_trial)
        
        db.commit()
        print(f"SUCCESS: Seeded {len(TRIALS)} trials with patient-friendly titles!")
        
    except Exception as e:
        db.rollback()
        print(f"ERROR: Failed to seed database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()