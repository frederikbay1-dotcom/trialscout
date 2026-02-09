from app.database import SessionLocal
from app.models.trial_db import TrialDB
from app.models import PatientProfile, BreastBiomarkers, PriorTreatment, Trial
from app.matching.rules import is_hard_excluded

# Create Patient A profile
patient = PatientProfile(
    age=61,
    sex='female',
    cancer_type='breast',
    stage='IV',
    ecog='0',
    biomarkers=BreastBiomarkers(
        ER='present',
        PR='present',
        HER2='low',
        Ki67=None
    ),
    prior_treatments=[
        PriorTreatment(category='targeted_therapy', name='CDK4/6 inhibitor'),
        PriorTreatment(category='hormone_therapy', name='Aromatase inhibitor')
    ],
    line_of_therapy='post_targeted'
)

print("Patient A Profile:")
print(f"  Age: {patient.age}, Sex: {patient.sex}")
print(f"  Cancer: {patient.cancer_type}, Stage: {patient.stage}, ECOG: {patient.ecog}")
print(f"  Biomarkers: ER={patient.biomarkers.ER}, PR={patient.biomarkers.PR}, HER2={patient.biomarkers.HER2}")
print(f"  Prior treatments: {len(patient.prior_treatments)}")
print()

# Get all breast trials from database
db = SessionLocal()
breast_trials_db = db.query(TrialDB).filter(TrialDB.cancer_type == 'breast').all()

print(f"Testing {len(breast_trials_db)} breast trials:\n")

matched = []
excluded = []

for trial_db in breast_trials_db:
    trial_dict = trial_db.to_dict()
    trial = Trial(**trial_dict)
    
    exclusion = is_hard_excluded(patient, trial)
    
    if exclusion:
        excluded.append((trial.id, trial.title[:60], exclusion))
        print(f"[X] {trial.id}: EXCLUDED")
        print(f"   Reason: {exclusion}")
    else:
        matched.append((trial.id, trial.title[:60]))
        print(f"[OK] {trial.id}: MATCHED")
    print()

print("\n" + "="*80)
print(f"SUMMARY: {len(matched)} matched, {len(excluded)} excluded")
print("="*80)

print("\nMatched trials:")
for trial_id, title in matched:
    print(f"  - {trial_id}: {title}")

print("\nExcluded trials:")
for trial_id, title, reason in excluded:
    print(f"  - {trial_id}: {title}")
    print(f"    Reason: {reason}")

db.close()