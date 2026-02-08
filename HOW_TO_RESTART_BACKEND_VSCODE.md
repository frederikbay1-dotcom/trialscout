# How to Restart Backend in VS Code

## Step-by-Step Visual Guide

### Step 1: Find the Terminal Panel in VS Code

1. **Look at the bottom of your VS Code window**
2. You should see a panel with tabs like "PROBLEMS", "OUTPUT", "DEBUG CONSOLE", **"TERMINAL"**
3. **Click on the "TERMINAL" tab** if it's not already selected

### Step 2: Identify Terminal 2

In the terminal panel, you'll see:
- A dropdown or tabs showing different terminals
- Look for **"Terminal 2"** or a terminal that shows:
  ```
  cd trialscout-backend && python -m app.main
  ```
- This is the backend terminal

### Step 3: Stop the Backend

1. **Click inside Terminal 2** to make it active
2. **Press `Ctrl+C`** on your keyboard
3. You should see the backend stop running

### Step 4: Restart the Backend

In the same Terminal 2, type these commands:

```bash
cd trialscout-backend
python -m app.main
```

Press **Enter** after each command.

### Step 5: Verify It's Working

You should see output like:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using StatReload
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

## Alternative: If You Can't Find Terminal 2

### Option A: Open a New Terminal
1. In VS Code, go to **Terminal** menu → **New Terminal**
2. In the new terminal, run:
   ```bash
   cd trialscout-backend
   python -m app.main
   ```

### Option B: Kill All Python Processes and Restart
1. Open a new terminal in VS Code
2. Run:
   ```bash
   taskkill /F /IM python.exe
   cd trialscout-backend
   python -m app.main
   ```

## How to Test If It Worked

### Test 1: Health Check
Open a new terminal and run:
```bash
curl http://localhost:8000/health
```

**Expected Result:**
```json
{
  "status": "ok",
  "dataset_version": "1.0",
  "last_updated": "2025-02-08T...",
  "total_trials": 4
}
```

**If you see this instead, it's still the old code:**
```json
{"detail":"Not Found"}
```

### Test 2: Check API Docs
Open your browser and go to:
```
http://localhost:8000/docs
```

You should see endpoints like:
- `GET /health`
- `GET /api/v1/trials`
- `POST /api/v1/match`
- etc.

## Visual Reference

```
┌─────────────────────────────────────────────────────────┐
│ VS Code Window                                          │
│                                                         │
│  [Your code files here]                                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ ▼ TERMINAL                                              │
│ ┌───────────────────────────────────────────────────┐  │
│ │ Terminal 2 ▼  Terminal 3 ▼                        │  │
│ ├───────────────────────────────────────────────────┤  │
│ │ PS C:\...\trialscout-backend>                     │  │
│ │ INFO: Uvicorn running on http://0.0.0.0:8000      │  │
│ │ [Click here and press Ctrl+C to stop]             │  │
│ └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Need Help?

If you're still having trouble:
1. Take a screenshot of your VS Code window
2. Or describe what you see in the terminal panel
3. I can provide more specific guidance

## After Successful Restart

Once the backend restarts successfully:
- ✅ Frontend will work at http://localhost:8080
- ✅ Backend API at http://localhost:8000
- ✅ No more "Network error" messages
- ✅ Trial matching will work!