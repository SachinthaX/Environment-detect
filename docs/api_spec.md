# API Specification – Mushroom Cultivation Support System

## 1. Overview

This document describes the REST API exposed by the FastAPI backend of the Mushroom Cultivation Support System.

**Current Status:** All endpoints return **dummy data** for testing. The API structure is ready for ML model integration without changing endpoint paths or response formats.

---

## 2. Base URL and Versioning

### Development URLs

**Local Machine:**
```
http://127.0.0.1:8000
```

**From Mobile Device (same Wi-Fi):**
```
http://<PC_IPv4>:8000
```
Example: `http://192.168.8.137:8000`

### API Version

All endpoints use `/api/v1/` prefix:
```
http://192.168.8.137:8000/api/v1/environment/status
```

### Interactive Documentation

FastAPI provides auto-generated docs:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

---

## 3. Authentication

- **Current:** None (development mode)
- **CORS:** All origins allowed for local testing
- **Future:** JWT-based authentication for production

---

## 4. Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Success |
| 400 | Bad Request | Invalid input |
| 404 | Not Found | Endpoint doesn't exist |
| 422 | Validation Error | Pydantic validation failed |
| 500 | Internal Server Error | Server error |

---

## 5. Endpoints Summary

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/ping` | Health check | ✅ Working |
| POST | `/predict` | Demo prediction | ✅ Working |
| GET | `/api/v1/environment/status` | Environment readings | ✅ Dummy |
| GET | `/api/v1/environment/recommendation` | Environment advice | ✅ Dummy |
| POST | `/api/v1/pests/predict` | Pest identification | ⚙️ Skeleton |
| POST | `/api/v1/disease/predict` | Disease detection | ⚙️ Skeleton |
| POST | `/api/v1/growth/predict` | Growth prediction | ⚙️ Skeleton |

---

## 6. Endpoint Details

### 6.1 Health Check – `GET /ping`

**Description:** Verify backend is running.

**Response:**
```json
{
  "message": "Backend is working!"
}
```

---

### 6.2 Demo Prediction – `POST /predict`

**Description:** Test endpoint that returns `value * 2`.

**Request:**
```json
{
  "value": 5.0
}
```

**Response:**
```json
{
  "input": 5.0,
  "prediction": 10.0,
  "note": "This is a dummy result. Replace with real model later."
}
```

---

### 6.3 Environment Status – `GET /api/v1/environment/status`

**Description:** Get current environment readings from sensors (dummy data now, will integrate with ESP32).

**Response:**
```json
{
  "temperature": 24.5,
  "humidity": 85.0,
  "co2": 650.0,
  "ammonia": 4.5,
  "note": "Dummy environment data from service layer"
}
```

**Fields:**
- `temperature` (float): Temperature in °C
- `humidity` (float): Relative humidity in %
- `co2` (float): CO₂ concentration in ppm
- `ammonia` (float): Ammonia concentration in ppm

---

### 6.4 Environment Recommendation – `GET /api/v1/environment/recommendation`

**Description:** Get intelligent recommendations for environment control.

**Response:**
```json
{
  "status": "OK",
  "recommendation": "Maintain humidity above 80% and keep temperature around 24°C."
}
```

**Fields:**
- `status` (string): `OK`, `WARNING`, or `CRITICAL`
- `recommendation` (string): Human-readable advice

---

### 6.5 Pest Prediction – `POST /api/v1/pests/predict`

**Description:** Identify pest type (will use CNN model for image analysis).

**Request:**
```json
{
  "sample_id": "sample-1"
}
```

**Response:**
```json
{
  "pest_name": "Fungus Gnat",
  "confidence": 0.85,
  "advice": "Increase ventilation and inspect the growing room for visible pests."
}
```

**Fields:**
- `pest_name` (string): Identified pest name
- `confidence` (float): Confidence score (0.0 - 1.0)
- `advice` (string): Treatment recommendation

---

### 6.6 Disease Prediction – `POST /api/v1/disease/predict`

**Description:** Detect mushroom diseases (will use ANN model for classification).

**Request:**
```json
{
  "sample_id": "sample-1"
}
```

**Response:**
```json
{
  "disease_name": "Green Mold",
  "confidence": 0.92,
  "severity": "moderate",
  "treatment": "Remove affected mushrooms and improve air circulation."
}
```

**Fields:**
- `disease_name` (string): Disease name
- `confidence` (float): Confidence score (0.0 - 1.0)
- `severity` (string): `mild`, `moderate`, or `severe`
- `treatment` (string): Treatment instructions

---

### 6.7 Growth Prediction – `POST /api/v1/growth/predict`

**Description:** Predict growth stage and yield (will use time-series analysis).

**Request:**
```json
{
  "sample_id": "sample-1"
}
```

**Response:**
```json
{
  "stage": "pinning",
  "days_until_harvest": 7,
  "expected_yield_kg": 3.2
}
```

**Fields:**
- `stage` (string): Current growth stage (e.g., `spawn_run`, `pinning`, `fruiting`)
- `days_until_harvest` (integer): Estimated days to harvest
- `expected_yield_kg` (float): Predicted yield in kg

---

## 7. Data Models

### Environment Schema
```python
class EnvironmentStatus(BaseModel):
    temperature: float
    humidity: float
    co2: float
    ammonia: float
    note: Optional[str]
```

### Pest Schema
```python
class PestPredictRequest(BaseModel):
    sample_id: str

class PestPredictResponse(BaseModel):
    pest_name: str
    confidence: float
    advice: str
```

### Disease Schema
```python
class DiseasePredictRequest(BaseModel):
    sample_id: str

class DiseasePredictResponse(BaseModel):
    disease_name: str
    confidence: float
    severity: str
    treatment: str
```

### Growth Schema
```python
class GrowthPredictRequest(BaseModel):
    sample_id: str

class GrowthPredictResponse(BaseModel):
    stage: str
    days_until_harvest: int
    expected_yield_kg: float
```

---

## 8. Integration Guide for Developers

### Backend Service Layer

Each module has a service file where ML models will be integrated:

```python
# backend/app/services/disease_service.py
def predict_disease(sample_id: str):
    # TODO: Load trained model from models/ directory
    # TODO: Preprocess image data
    # TODO: Run inference
    # TODO: Return predictions
    
    # Current: Returns dummy data
    return {
        "disease_name": "Dummy Disease",
        "confidence": 0.9,
        "severity": "moderate",
        "treatment": "Dummy treatment advice"
    }
```

### Mobile App API Calls

Example from `MobileAppExpo/src/services/diseaseApi.js`:

```javascript
import { BACKEND_URL } from './api';

export const predictDisease = async (sampleId) => {
  const response = await fetch(`${BACKEND_URL}/api/v1/disease/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sample_id: sampleId })
  });
  return response.json();
};
```

### Testing Endpoints

Use cURL to test:
```bash
# Health check
curl http://127.0.0.1:8000/ping

# Environment status
curl http://127.0.0.1:8000/api/v1/environment/status

# Disease prediction
curl -X POST http://127.0.0.1:8000/api/v1/disease/predict \
  -H "Content-Type: application/json" \
  -d '{"sample_id": "test-001"}'
```

---

## 9. Future Development

### ML Model Integration
1. Train models in Google Colab
2. Export models to `backend/app/models/`
3. Update service files to load and use models
4. API endpoints remain unchanged

### Database Integration
- Add PostgreSQL/MongoDB for data persistence
- Store user data, sensor readings, and prediction history
- Environment readings table
- Prediction history table

### Production Checklist
- [ ] Add JWT authentication
- [ ] Implement rate limiting
- [ ] Configure HTTPS
- [ ] Restrict CORS to specific origins
- [ ] Add logging and monitoring
- [ ] Set up database

---

## 10. Contact

For API questions, see team contacts in [README.md](../README.md) or report issues on GitHub.

---

**Last Updated:** November 2025