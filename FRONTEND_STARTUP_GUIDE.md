# Frontend Startup Guide

## Current Status

✅ **Backend**: Running on http://localhost:8000  
❌ **Frontend**: Not running (needs to be started)

## Quick Start Instructions

### Option 1: Start Frontend in New Terminal

Open a new terminal and run:

```bash
cd remix-of-oncology-scout
npm run dev
```

The frontend should start on http://localhost:5173

### Option 2: Check Existing Terminals

If you have terminals 3 and 4 already open:

1. Click on Terminal 3 or 4 in VS Code
2. Press `Ctrl+C` to stop any existing process
3. Run: `npm run dev`

### Verify Frontend is Running

After starting, you should see output like:

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Access the Application

Once the frontend is running, open your browser to:
- **Primary**: http://localhost:5173
- **Alternative**: http://localhost:5174 (if 5173 is in use)

## Troubleshooting

### Error: "Port 5173 already in use"

If you see this error, either:
1. Kill the process using port 5173
2. The frontend will automatically use port 5174

### Error: "Cannot find module"

Run:
```bash
cd remix-of-oncology-scout
npm install
npm run dev
```

### Error: "ECONNREFUSED" when accessing backend

Make sure the backend is running:
```bash
cd trialscout-backend
python -m app.main
```

## Verify Integration

Once both services are running:

1. **Backend Health Check**:
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"ok","total_trials":20,...}`

2. **Frontend Access**:
   Open http://localhost:5173 in your browser
   You should see the TrialScout landing page

3. **Test Patient Matching**:
   - Fill out the patient profile form
   - Click "Find Trials"
   - You should see matched trials from the database

## Current Configuration

### Backend
- **URL**: http://localhost:8000
- **Database**: SQLite (`trialscout.db`)
- **Trials**: 20 (10 breast, 10 lung)
- **Status**: ✅ Running

### Frontend
- **Expected URL**: http://localhost:5173
- **API Endpoint**: http://localhost:8000 (configured in `.env`)
- **Mock Data**: Disabled
- **Status**: ❌ Needs to be started

## Complete Startup Sequence

To start both services from scratch:

### Terminal 1 - Backend
```bash
cd trialscout-backend
python -m app.main
```

Wait for: `INFO:     Application startup complete.`

### Terminal 2 - Frontend
```bash
cd remix-of-oncology-scout
npm run dev
```

Wait for: `➜  Local:   http://localhost:5173/`

### Verify
```bash
# Check backend
curl http://localhost:8000/health

# Open frontend in browser
start http://localhost:5173
```

## Integration Test

Once both are running, test the full flow:

1. Navigate to http://localhost:5173
2. Click "Get Started" or "Find Trials"
3. Fill in patient information:
   - Age: 58
   - Sex: Female
   - Cancer Type: Breast
   - Stage: IV
   - ECOG: 1
   - Biomarkers: ER+, PR+, HER2-negative
4. Add treatment history (e.g., "Palbociclib + Letrozole")
5. Click "Find Matching Trials"
6. You should see 5 matched breast cancer trials from the database

## Need Help?

If you continue to have issues:

1. Check that both terminals are in the correct directories
2. Verify no other processes are using ports 5173 or 8000
3. Check the terminal output for error messages
4. Ensure all dependencies are installed (`npm install` for frontend, `pip install -r requirements.txt` for backend)

## Documentation

- Backend Integration: `trialscout-backend/DATABASE_INTEGRATION.md`
- Integration Tests: `trialscout-backend/INTEGRATION_TEST_REPORT.md`
- Backend API Docs: http://localhost:8000/docs (when backend is running)