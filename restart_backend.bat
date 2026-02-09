@echo off
echo Stopping backend...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *trialscout-backend*" 2>nul
timeout /t 2 /nobreak >nul
echo Starting backend...
cd trialscout-backend
start "TrialScout Backend" cmd /k "python -m app.main"
echo Backend restarted!