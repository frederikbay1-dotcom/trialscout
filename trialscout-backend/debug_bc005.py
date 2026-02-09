from app.database import SessionLocal
from app.models.trial_db import TrialDB

db = SessionLocal()
breast_trials = db.query(TrialDB).filter(TrialDB.cancer_type == 'breast').all()
print(f'Total breast trials: {len(breast_trials)}')
print('\nBreast trial IDs:')
for t in breast_trials:
    print(f'  {t.id}: {t.eligibility_score}')

print('\nChecking bc_trial_005:')
bc005 = db.query(TrialDB).filter(TrialDB.id == 'bc_trial_005').first()
if bc005:
    print(f'  Found: {bc005.id}')
    print(f'  Title: {bc005.title}')
    print(f'  Eligibility: {bc005.eligibility_score}')
else:
    print('  NOT FOUND!')

db.close()