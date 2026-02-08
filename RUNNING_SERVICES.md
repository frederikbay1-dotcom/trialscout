# TrialScout Running Services

## 🚀 Services Status

Both backend and frontend are now running!

### Backend API (FastAPI)
- **URL**: http://localhost:8000
- **API Documentation (Swagger)**: http://localhost:8000/docs
- **API Documentation (ReDoc)**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health
- **Status**: ✅ Running

### Frontend Application (React + Vite)
- **URL**: http://localhost:8080
- **Network URL**: http://192.168.1.160:8080
- **Status**: ✅ Running

## 📋 Quick Test Commands

### Test Backend Health
```bash
curl http://localhost:8000/health
```

### Test List Trials
```bash
curl http://localhost:8000/api/v1/trials
```

### Test Specific Trial
```bash
curl http://localhost:8000/api/v1/trials/NCT05234567
```

## 🎯 How to Use

1. **Open Frontend**: Navigate to http://localhost:8080
2. **Start Assessment**: Click "Start Assessment" or "Try with Sample Patient"
3. **Complete Intake**: Fill in patient information
4. **View Results**: See matched clinical trials
5. **Explore Details**: Click on trials to see full details

## 🔧 API Endpoints Available

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/trials` | List all trials |
| GET | `/api/v1/trials/{nct}` | Get trial details |
| POST | `/api/v1/match` | Match patient to trials |
| POST | `/api/v1/trials` | Create new trial |
| PUT | `/api/v1/trials/{nct}` | Update trial |
| PATCH | `/api/v1/trials/{nct}` | Partial update |
| DELETE | `/api/v1/trials/{nct}` | Delete trial |
| POST | `/api/v1/trials/bulk` | Bulk import |

## 📊 Current Data

- **Total Trials**: 4 (2 breast cancer, 2 lung cancer)
- **Dataset Version**: 1.0
- **Locations**: NYC metro area

## 🛑 To Stop Services

### Stop Backend
Press `Ctrl+C` in Terminal 2

### Stop Frontend
Press `Ctrl+C` in Terminal 3

## 📚 Documentation

- [Frontend-Backend Integration Guide](FRONTEND_BACKEND_INTEGRATION.md)
- [Backend Update Summary](trialscout-backend/BACKEND_UPDATE_SUMMARY.md)
- [Backend Specification](TrialScout_Backend_Spec.md)

## ✅ Integration Status

- ✅ Backend API running on port 8000
- ✅ Frontend running on port 8080
- ✅ CORS configured correctly
- ✅ API endpoints updated to `/api/v1/*`
- ✅ Type definitions synchronized
- ✅ Data transformation working
- ✅ All 9 API endpoints operational

## 🎉 Ready to Test!

Your TrialScout application is fully operational. Visit http://localhost:8080 to start using it!