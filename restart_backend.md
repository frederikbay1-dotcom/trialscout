# How to Restart the Backend

The backend needs to be restarted to load the new code changes.

## Steps:

1. **Stop the current backend**:
   - Go to Terminal 2 (where backend is running)
   - Press `Ctrl+C` to stop it

2. **Restart the backend**:
   ```bash
   cd trialscout-backend
   python -m app.main
   ```

3. **Verify it's working**:
   ```bash
   curl http://localhost:8000/health
   ```
   
   Should return:
   ```json
   {
     "status": "ok",
     "dataset_version": "1.0",
     "last_updated": "...",
     "total_trials": 4
   }
   ```

## Why This is Needed

The backend was started before the new code was created. The auto-reload feature only detects changes to existing files, not new files. Since we created entirely new model files and restructured the code, a manual restart is required.

## After Restart

Once restarted, the following endpoints will be available:
- `GET /health` ✅
- `GET /api/v1/trials` ✅
- `GET /api/v1/trials/{nct}` ✅
- `POST /api/v1/match` ✅
- And all other CRUD endpoints ✅