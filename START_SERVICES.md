# Starting TrialScout Services

This guide explains how to start both the frontend and backend services for TrialScout.

## Prerequisites

### Backend Requirements
- Python 3.8 or higher
- pip (Python package manager)

### Frontend Requirements
- Node.js 16 or higher
- npm or bun

## Quick Start

### Option 1: Start Both Services (Recommended)

#### Windows (PowerShell)
```powershell
# Terminal 1 - Start Backend
cd trialscout-backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py

# Terminal 2 - Start Frontend
cd remix-of-oncology-scout
npm install
npm run dev
```

#### macOS/Linux (Bash)
```bash
# Terminal 1 - Start Backend
cd trialscout-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py

# Terminal 2 - Start Frontend
cd remix-of-oncology-scout
npm install
npm run dev
```

### Option 2: Start Services Individually

#### Backend Only
```bash
cd trialscout-backend

# First time setup
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Create .env file (if not exists)
cp .env.example .env

# Start server
python run.py
```

Backend will be available at: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

#### Frontend Only
```bash
cd remix-of-oncology-scout

# First time setup
npm install

# Create .env file (if not exists)
cp .env.example .env

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## Verification

### 1. Check Backend Health
Open browser to: `http://localhost:8000/api/health`

Expected response:
```json
{
  "status": "ok",
  "dataset_version": "1.0",
  "last_updated": "2025-02-07T...",
  "total_trials": 14
}
```

### 2. Check Frontend
Open browser to: `http://localhost:5173`

You should see the TrialScout landing page.

### 3. Test Integration
1. Complete the patient profile form
2. Click "Find Trials"
3. Verify trials load from backend (check Network tab in DevTools)
4. Try downloading a clinician brief

## Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
# Find process using port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

**Module not found errors:**
```bash
pip install -r requirements.txt --force-reinstall
```

**Database errors:**
```bash
# Delete and recreate database
rm trialscout.db
python run.py  # Will recreate with seed data
```

### Frontend Issues

**Port 5173 already in use:**
The frontend will automatically try the next available port (5174, 5175, etc.)

**Module not found errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**API connection errors:**
1. Verify backend is running: `curl http://localhost:8000/api/health`
2. Check `.env` file has correct `VITE_API_BASE_URL=http://localhost:8000`
3. Restart frontend: `npm run dev`

### CORS Errors

If you see CORS errors in browser console:

1. Check backend `.env` has:
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

2. Restart backend after changing `.env`

## Development Workflow

### Typical Development Session

1. **Start Backend** (Terminal 1)
   ```bash
   cd trialscout-backend
   source venv/bin/activate  # or .\venv\Scripts\Activate.ps1
   python run.py
   ```

2. **Start Frontend** (Terminal 2)
   ```bash
   cd remix-of-oncology-scout
   npm run dev
   ```

3. **Make Changes**
   - Backend: Changes auto-reload with uvicorn
   - Frontend: Changes auto-reload with Vite

4. **View Logs**
   - Backend logs appear in Terminal 1
   - Frontend logs appear in Terminal 2 and browser console

## Production Deployment

### Backend
```bash
cd trialscout-backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd remix-of-oncology-scout
npm run build
npm run preview  # Test production build
```

Deploy `dist/` folder to your hosting service.

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=sqlite:///./trialscout.db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
DATASET_VERSION=1.0
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_ENABLE_MOCK_DATA=false
```

## Useful Commands

### Backend
```bash
# Run tests
pytest

# Check code style
black app/
flake8 app/

# Seed database
python -m app.seed_data

# View API docs
# Open http://localhost:8000/docs
```

### Frontend
```bash
# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Next Steps

Once both services are running:

1. Test the complete user flow
2. Verify trial matching works
3. Test PDF generation
4. Check error handling
5. Review performance

## Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review `BACKEND_INTEGRATION.md` for integration details
3. Check backend logs in Terminal 1
4. Check browser console for frontend errors
5. Verify both services are running on correct ports

---

**Last Updated**: February 7, 2025