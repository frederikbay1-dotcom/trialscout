# Stop the Old Backend (Terminal 2)

## The Problem
You have TWO backend servers trying to run:
- **Terminal 2**: OLD code (currently serving on port 8000)
- **Terminal 6**: NEW code (started but can't bind to port 8000)

Only Terminal 2 is actually responding to requests because it claimed port 8000 first.

## Solution: Stop Terminal 2

### Step 1: Find Terminal 2 in VS Code
1. Look at the **bottom of VS Code**
2. Click the **TERMINAL** tab
3. Look for the terminal dropdown - you'll see multiple terminals listed
4. **Click on "Terminal 2"** to switch to it

### Step 2: Stop It
1. Make sure Terminal 2 is active (click inside it)
2. Press **`Ctrl+C`** on your keyboard
3. You should see it stop

### Step 3: Verify Terminal 6 is Working
After stopping Terminal 2, Terminal 6 (the new backend) should automatically start serving requests.

Test it by running in a NEW terminal or PowerShell:
```powershell
curl http://localhost:8000/health
```

**You should now see:**
```json
{
  "status": "ok",
  "dataset_version": "1.0",
  "last_updated": "2025-02-08T...",
  "total_trials": 4
}
```

**NOT this:**
```json
{"detail":"Not Found"}
```

## Alternative: Kill All Python Processes

If you can't find Terminal 2, you can kill all Python processes:

1. Open a new terminal in VS Code
2. Run:
```powershell
taskkill /F /IM python.exe
```
3. Then Terminal 6 will automatically take over port 8000

## After Stopping Terminal 2

Once Terminal 2 is stopped:
- ✅ Terminal 6 (new backend) will serve requests on port 8000
- ✅ Frontend at http://localhost:8080 will work
- ✅ No more "Network error" messages
- ✅ Trial matching will work!

## Current Terminal Status

- **Terminal 2**: OLD backend code (NEEDS TO BE STOPPED) ❌
- **Terminal 3**: Frontend (keep running) ✅
- **Terminal 6**: NEW backend code (waiting for port 8000) ⏳

After stopping Terminal 2:
- **Terminal 3**: Frontend (keep running) ✅
- **Terminal 6**: NEW backend code (will serve on port 8000) ✅