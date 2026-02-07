# TrialScout Backend - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies

```bash
cd trialscout-backend
pip install -r requirements.txt
```

### 2. Configure Database

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```
DATABASE_URL=postgresql://user:password@localhost:5432/trialscout
```

### 3. Create Database

```sql
CREATE DATABASE trialscout;
```

### 4. Seed Sample Data

```bash
python -m app.seed_data
```

Expected output:
```
🌱 Seeding TrialScout database...
Creating sample trials...
  ✓ Created trial: NCT05123456
  ✓ Created trial: NCT05234567
  ...
✅ Successfully seeded 20 trials!
   - 10 breast cancer trials
   - 10 lung cancer trials
```

### 5. Run the Server

```bash
python run.py
```

Or:

```bash
uvicorn app.main:app --reload
```

### 6. Test the API

Open your browser:
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health

## 📁 Project Structure

```
trialscout-backend/
├── app/
│   ├── __init__.py           # Package initialization
│   ├── main.py               # FastAPI application & endpoints
│   ├── config.py             # Configuration settings
│   ├── database.py           # Database connection
│   ├── models.py             # SQLAlchemy models
│   ├── schemas.py            # Pydantic schemas
│   ├── matching_engine.py    # Rule-based matching algorithm
│   ├── pdf_generator.py      # PDF clinician brief generator
│   └── seed_data.py          # Database seeding script
├── requirements.txt          # Python dependencies
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── run.py                   # Quick start script
├── README.md                # Full documentation
├── INTEGRATION_GUIDE.md     # Frontend integration guide
└── QUICK_START.md           # This file
```

## 🔑 Key API Endpoints

### Match Trials
```bash
POST /api/match
```

Example request:
```json
{
  "cancer_type": "breast",
  "stage": "IV",
  "ecog": 1,
  "biomarkers": {
    "HER2": {"status": "present", "subtype": "low"}
  },
  "prior_therapies": ["Endocrine therapy"],
  "current_line": "second-line"
}
```

### Get Trial Details
```bash
GET /api/trials/NCT05123456
```

### Generate Clinician Brief
```bash
POST /api/brief
```

### Health Check
```bash
GET /api/health
```

## 🧪 Test with Sample Data

### Test Case 1: HER2-Low Breast Cancer

```bash
curl -X POST http://localhost:8000/api/match \
  -H "Content-Type: application/json" \
  -d '{
    "cancer_type": "breast",
    "stage": "IV",
    "ecog": 1,
    "biomarkers": {
      "HER2": {"status": "present", "subtype": "low"},
      "ER": {"status": "present"},
      "PR": {"status": "present"}
    },
    "prior_therapies": ["Endocrine therapy"],
    "current_line": "second-line"
  }'
```

Expected: Should match NCT05123456 with high confidence

### Test Case 2: EGFR-Mutant NSCLC

```bash
curl -X POST http://localhost:8000/api/match \
  -H "Content-Type: application/json" \
  -d '{
    "cancer_type": "lung",
    "stage": "IV",
    "ecog": 1,
    "biomarkers": {
      "EGFR": {"status": "present", "subtype": "exon 19 deletion"}
    },
    "prior_therapies": ["Gefitinib"],
    "current_line": "post-targeted"
  }'
```

Expected: Should match NCT05678901 with high confidence

## 📊 Database Schema

### trials
- Basic trial information (NCT number, title, phase, etc.)
- Location and distance
- Cancer type and eligibility score

### eligibility_criteria
- Criterion text
- Category (biomarker, stage, ecog, treatment_history)
- Required flag

### trial_metadata
- Flexible key-value storage
- Translated info (plain language descriptions)
- Patient burden information

## 🔧 Common Issues

### Issue: "python not found"
**Solution**: Use `py` or `python3` instead of `python`

### Issue: "Database connection failed"
**Solution**: 
1. Verify PostgreSQL is running
2. Check DATABASE_URL in `.env`
3. Ensure database exists: `CREATE DATABASE trialscout;`

### Issue: "Module not found"
**Solution**: 
1. Activate virtual environment
2. Install dependencies: `pip install -r requirements.txt`

### Issue: "CORS error from frontend"
**Solution**: Add your frontend URL to `CORS_ORIGINS` in `.env`

## 📚 Next Steps

1. **Read Full Documentation**: See [`README.md`](README.md)
2. **Frontend Integration**: See [`INTEGRATION_GUIDE.md`](INTEGRATION_GUIDE.md)
3. **Customize Trials**: Edit [`app/seed_data.py`](app/seed_data.py)
4. **Deploy**: Follow deployment checklist in README

## 🆘 Need Help?

- **API Documentation**: http://localhost:8000/docs
- **PRD Reference**: `../TrialScout_PRD_v1.0.md`
- **Issues**: Check logs in terminal

## ✅ Verification Checklist

- [ ] Dependencies installed
- [ ] Database created
- [ ] `.env` configured
- [ ] Sample data seeded (20 trials)
- [ ] Server running on port 8000
- [ ] Health check returns "ok"
- [ ] API docs accessible
- [ ] Test match request works

---

**Version**: 1.0.0  
**Last Updated**: February 7, 2025