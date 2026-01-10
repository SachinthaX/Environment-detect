# API Specification – Smart Mushroom Cultivation Analytics Framework

**Version**: 1.0.0  
**Last Updated**: January 10, 2026  
**Base Path**: `/api/v1`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Base URL & Versioning](#2-base-url--versioning)
3. [Authentication & Security](#3-authentication--security)
4. [Response Codes](#4-response-codes)
5. [Endpoints Summary](#5-endpoints-summary)
6. [General Endpoints](#6-general-endpoints)
7. [Environment Module](#7-environment-module)
8. [Disease Module](#8-disease-module)
9. [Type Module](#9-type-module)
10. [Pests Module](#10-pests-module)
11. [Growth Module](#11-growth-module)
12. [Data Models](#12-data-models)
13. [Error Handling](#13-error-handling)
14. [Rate Limiting](#14-rate-limiting)

---

## 1. Overview

This REST API provides comprehensive mushroom cultivation management capabilities including:

- **Environmental Monitoring**: Real-time sensor data ingestion and retrieval
- **Intelligent Alerts**: Consecutive-reading based alert system for temperature and humidity
- **Historical Analysis**: Time-bucketed historical data with timezone support
- **Variety Recommendations**: AI-powered mushroom variety matching
- **Disease Detection**: Image-based disease classification (Keras model)
- **Type Classification**: Mushroom variety identification (TFLite model)
- **Future Integrations**: Pest detection and growth prediction (endpoints ready)

### Current Implementation Status

| Module | Status | Notes |
|--------|--------|-------|
| Environment | ✅ Fully Integrated | PostgreSQL backend with all features |
| Disease Detection | ✅ Fully Integrated | Keras .h5 model inference |
| Type Classification | ✅ Fully Integrated | TFLite model with quality checks |
| Pests Detection | 🔄 Placeholder | Returns dummy data, ready for model |
| Growth Prediction | 🔄 Placeholder | Returns dummy data, ready for model |

---

## 2. Base URL & Versioning

### Local Development
```
http://127.0.0.1:8000
```

### Network Access (Same WiFi)
```
http://<YOUR_PC_IPV4>:8000
```

Find your IP address:
- Windows: `ipconfig`
- macOS/Linux: `ifconfig` or `ip addr`

### API Version Prefix
All endpoints are prefixed with:
```
/api/v1
```

### Interactive Documentation

The API provides built-in interactive documentation:

| Tool | URL | Description |
|------|-----|-------------|
| Swagger UI | `/docs` | Interactive API testing interface |
| ReDoc | `/redoc` | Clean, readable API documentation |
| OpenAPI JSON | `/openapi.json` | Machine-readable API specification |

---

## 3. Authentication & Security

### Current Implementation (Development)
- **Authentication**: None (open access)
- **CORS**: Enabled for all origins (`*`)
- **HTTPS**: Not required (HTTP only)

### Production Recommendations
- Implement JWT or API key authentication
- Restrict CORS to specific domains
- Enable HTTPS/TLS encryption
- Add rate limiting per user/IP
- Implement request validation and sanitization

---

## 4. Response Codes

### Success Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `200` | OK | Successful GET, PUT, or POST with data return |
| `201` | Created | Successful POST creating new resource |
| `204` | No Content | Successful DELETE or PUT with no return data |

### Client Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `400` | Bad Request | Invalid input data, missing required fields |
| `404` | Not Found | Resource doesn't exist, invalid endpoint |
| `415` | Unsupported Media Type | Wrong Content-Type header for file upload |
| `422` | Validation Error | Pydantic schema validation failure |

### Server Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `500` | Internal Server Error | Database error, model loading failure, unexpected exception |

---

## 5. Endpoints Summary

### General Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ping` | Health check and API availability |
| POST | `/predict` | Demo prediction endpoint (testing) |

### Environment Module (`/api/v1/environment`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/readings` | Insert new sensor reading |
| GET | `/status` | Get current status (reading + profile + alerts) |
| GET | `/health` | Check sensor node online/offline status |
| GET | `/options` | Get available mushroom types and stages |
| GET | `/profile` | Get current cultivation profile |
| PUT | `/profile` | Update cultivation profile |
| GET | `/optimal-range` | Get optimal ranges for type and stage |
| GET | `/history` | Get historical data (bucketed) |
| GET | `/available-dates` | Get dates with readings |
| GET | `/recommendation` | Get variety recommendations |

### AI Modules

| Method | Endpoint | Module | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/disease/predict` | Disease | Detect disease from image |
| POST | `/api/v1/type/predict` | Type | Classify mushroom variety from image |
| POST | `/api/v1/pests/predict` | Pests | Detect pests (placeholder) |
| POST | `/api/v1/growth/predict` | Growth | Predict growth stage (placeholder) |

---

## 6. General Endpoints

### 6.1 Health Check

**Endpoint**: `GET /ping`

**Description**: Simple health check to verify API is running.

**Response**:
```json
{
  "message": "Backend is working!"
}
```

**cURL Example**:
```bash
curl http://127.0.0.1:8000/ping
```

---

### 6.2 Demo Prediction

**Endpoint**: `POST /predict`

**Description**: Testing endpoint that doubles input value.

**Request Body**:
```json
{
  "value": 5.0
}
```

**Response**:
```json
{
  "input": 5.0,
  "prediction": 10.0,
  "note": "This is a dummy result. Replace with real model later."
}
```

**cURL Example**:
```bash
curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"value": 5.0}'
```

---

## 7. Environment Module

### Overview

The environment module manages all aspects of environmental monitoring including:
- Sensor data ingestion from IoT nodes
- Real-time status and alerts
- Historical trend analysis
- Variety recommendations
- Profile management

**Important Notes**:
- CO₂ values are stored and displayed but not used in alerts or recommendations
- All decisions use temperature and humidity only
- Date-based queries use Asia/Colombo timezone
- Alerts use consecutive-reading logic to prevent false alarms

---

### 7.1 Insert Reading

**Endpoint**: `POST /api/v1/environment/readings`

**Description**: Insert a new sensor reading (from ESP32 or simulator).

**Request Body**:
```json
{
  "temperature": 25.0,
  "humidity": 95.0,
  "co2": 900.0,
  "node_id": "esp32-01",
  "sampled_at": "2026-01-10T12:00:00Z"
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `temperature` | float | ✅ | Temperature in °C |
| `humidity` | float | ✅ | Relative humidity in %RH |
| `co2` | float | ❌ | Estimated CO₂ in ppm |
| `node_id` | string | ❌ | Sensor node identifier |
| `sampled_at` | string (ISO 8601) | ❌ | Reading timestamp (defaults to current UTC) |

**Response** (200):
```json
{
  "id": 1374,
  "sampled_at": "2026-01-10T12:00:00Z",
  "temperature": 25.0,
  "humidity": 95.0,
  "co2_estimated": 900.0,
  "node_id": "esp32-01",
  "note": null
}
```

**cURL Example**:
```bash
curl -X POST http://127.0.0.1:8000/api/v1/environment/readings \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 25.0,
    "humidity": 95.0,
    "co2": 900.0,
    "node_id": "esp32-01"
  }'
```

**ESP32 Integration Example**:
```cpp
// Arduino/ESP32 code snippet
String jsonPayload = "{\"temperature\":" + String(temp) + 
                     ",\"humidity\":" + String(hum) + 
                     ",\"co2\":" + String(co2) + 
                     ",\"node_id\":\"esp32-01\"}";

HTTPClient http;
http.begin("http://YOUR_SERVER:8000/api/v1/environment/readings");
http.addHeader("Content-Type", "application/json");
int httpCode = http.POST(jsonPayload);
```

---

### 7.2 Get Current Status

**Endpoint**: `GET /api/v1/environment/status`

**Description**: Get comprehensive current status including latest reading, profile, optimal range, and active alerts.

**Response** (200):
```json
{
  "reading": {
    "id": 1374,
    "sampled_at": "2026-01-10T12:00:00Z",
    "temperature": 25.0,
    "humidity": 95.0,
    "co2_estimated": 900.0,
    "node_id": "esp32-01",
    "note": null
  },
  "profile": {
    "mushroom_type": "Oyster Mushroom",
    "stage": "fruiting",
    "updated_at": "2026-01-10T11:55:00Z"
  },
  "optimal_range": {
    "temp_min": 19.0,
    "temp_max": 20.0,
    "rh_min": 85.0,
    "rh_max": 92.0,
    "co2_min": 600.0,
    "co2_max": 600.0,
    "co2_note": "Estimated only (display)"
  },
  "alerts": [
    {
      "param": "temperature",
      "active": false,
      "bad_count": 0,
      "good_count": 2,
      "state_changed_at": "2026-01-10T11:40:00Z",
      "last_value": 20.0,
      "last_message": "Temperature back to normal. Current 20.0, optimal 19-20."
    },
    {
      "param": "humidity",
      "active": true,
      "bad_count": 6,
      "good_count": 0,
      "state_changed_at": "2026-01-10T12:00:00Z",
      "last_value": 95.0,
      "last_message": "Humidity too high! Current 95.0, optimal 85-92."
    }
  ]
}
```

**Alert Logic**:
- **Activation**: Alert becomes active after 6 consecutive out-of-range readings
- **Deactivation**: Alert becomes inactive after 2 consecutive in-range readings
- **Purpose**: Prevents false alarms from brief sensor fluctuations

**cURL Example**:
```bash
curl http://127.0.0.1:8000/api/v1/environment/status
```

---

### 7.3 Get Sensor Health

**Endpoint**: `GET /api/v1/environment/health`

**Description**: Check if sensor node is online based on last reading timestamp.

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `offline_after_seconds` | integer | 60 | Seconds after which node is considered offline |

**Response** (200) - Online:
```json
{
  "online": true,
  "last_seen": "2026-01-10T12:00:00Z",
  "node_id": "esp32-01",
  "seconds_since_last": 12
}
```

**Response** (200) - Offline:
```json
{
  "online": false,
  "last_seen": "2026-01-10T11:30:00Z",
  "node_id": "esp32-01",
  "seconds_since_last": 1812
}
```

**Response** (200) - No Data:
```json
{
  "online": false,
  "last_seen": null,
  "node_id": null,
  "seconds_since_last": null
}
```

**cURL Examples**:
```bash
# Default 60-second threshold
curl http://127.0.0.1:8000/api/v1/environment/health

# Custom 300-second threshold
curl "http://127.0.0.1:8000/api/v1/environment/health?offline_after_seconds=300"
```

---

### 7.4 Get Available Options

**Endpoint**: `GET /api/v1/environment/options`

**Description**: Get available mushroom types and cultivation stages (from database seed data).

**Response** (200):
```json
{
  "mushrooms": [
    "Abalone Mushroom",
    "Button Mushroom",
    "Milky Mushroom",
    "Oyster Mushroom",
    "Paddy Straw Mushroom"
  ],
  "stages": [
    {
      "key": "spawn_run",
      "label": "Spawn Run"
    },
    {
      "key": "fruiting",
      "label": "Fruiting Phase"
    }
  ]
}
```

**Usage**: Populate dropdown menus in mobile app for profile selection.

**cURL Example**:
```bash
curl http://127.0.0.1:8000/api/v1/environment/options
```

---

### 7.5 Get Current Profile

**Endpoint**: `GET /api/v1/environment/profile`

**Description**: Get currently selected mushroom type and cultivation stage.

**Response** (200) - Profile Set:
```json
{
  "mushroom_type": "Oyster Mushroom",
  "stage": "fruiting",
  "updated_at": "2026-01-10T11:55:00Z"
}
```

**Response** (200) - Profile Not Set:
```json
{
  "mushroom_type": null,
  "stage": null,
  "updated_at": "2026-01-10T11:20:00Z"
}
```

**cURL Example**:
```bash
curl http://127.0.0.1:8000/api/v1/environment/profile
```

---

### 7.6 Update Profile

**Endpoint**: `PUT /api/v1/environment/profile`

**Description**: Update cultivation profile (mushroom type and stage). **Resets all alert counters and states.**

**Request Body**:
```json
{
  "mushroom_type": "Oyster Mushroom",
  "stage": "fruiting"
}
```

**Parameters**:

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `mushroom_type` | string | ✅ | See `/options` endpoint |
| `stage` | string | ✅ | `spawn_run` or `fruiting` |

**Response** (200):
```json
{
  "mushroom_type": "Oyster Mushroom",
  "stage": "fruiting",
  "updated_at": "2026-01-10T12:05:00Z"
}
```

**Error Response** (400) - Invalid Combination:
```json
{
  "detail": "No optimal range found for mushroom_type='Unknown Mushroom' and stage='fruiting'"
}
```

**Side Effects**:
- Resets temperature alert counters to 0
- Resets humidity alert counters to 0
- Clears alert active states
- Updates optimal range reference

**cURL Example**:
```bash
curl -X PUT http://127.0.0.1:8000/api/v1/environment/profile \
  -H "Content-Type: application/json" \
  -d '{
    "mushroom_type": "Oyster Mushroom",
    "stage": "fruiting"
  }'
```

---

### 7.7 Get Optimal Range

**Endpoint**: `GET /api/v1/environment/optimal-range`

**Description**: Get optimal environmental ranges for a specific mushroom type and cultivation stage.

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mushroom_type` | string | ✅ | Mushroom variety name |
| `stage` | string | ✅ | `spawn_run` or `fruiting` |

**Response** (200):
```json
{
  "temp_min": 19.0,
  "temp_max": 20.0,
  "rh_min": 85.0,
  "rh_max": 92.0,
  "co2_min": 600.0,
  "co2_max": 600.0,
  "co2_note": "Estimated only (display)"
}
```

**Error Response** (404):
```json
{
  "detail": "No optimal range found for mushroom_type='Invalid Type' and stage='fruiting'"
}
```

**cURL Example**:
```bash
curl "http://127.0.0.1:8000/api/v1/environment/optimal-range?mushroom_type=Oyster%20Mushroom&stage=fruiting"
```

**Pre-seeded Ranges** (examples):

| Mushroom Type | Stage | Temp (°C) | Humidity (%RH) |
|---------------|-------|-----------|----------------|
| Oyster Mushroom | fruiting | 19-20 | 85-92 |
| Oyster Mushroom | spawn_run | 20-25 | 85-95 |
| Button Mushroom | fruiting | 15-18 | 80-90 |
| Paddy Straw | fruiting | 28-35 | 80-85 |

---

### 7.8 Get Historical Data

**Endpoint**: `GET /api/v1/environment/history`

**Description**: Get time-bucketed historical readings for chart visualization.

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `range` | string | ✅ | `last_1h`, `last_day`, or `date` |
| `date` | string (YYYY-MM-DD) | ⚠️ | Required when `range=date` |

**Range Options**:

| Range | Buckets | Interval | Window |
|-------|---------|----------|--------|
| `last_1h` | 12 | 5 minutes | Last 60 minutes |
| `last_day` | 24 | 1 hour | Last 24 hours |
| `date` | 24 | 1 hour | Specific date (Asia/Colombo timezone) |

**Response** (200):
```json
{
  "range": "last_1h",
  "bucket_seconds": 300,
  "points": [
    {
      "ts": "2026-01-10T11:00:00Z",
      "temperature": 25.2,
      "humidity": 91.0,
      "co2": 880.0
    },
    {
      "ts": "2026-01-10T11:05:00Z",
      "temperature": 25.0,
      "humidity": 90.4,
      "co2": 900.0
    },
    {
      "ts": "2026-01-10T11:10:00Z",
      "temperature": null,
      "humidity": null,
      "co2": null
    }
  ]
}
```

**Notes**:
- Missing data buckets return `null` values but timestamps are always present
- Values are averages within each bucket
- For `date` range, buckets align to midnight-to-midnight in Asia/Colombo timezone

**Suggested Chart Axes** (for consistent comparison):
- Temperature: 0–45°C
- Humidity: 0–100%
- CO₂: 0–5000 ppm

**cURL Examples**:
```bash
# Last hour
curl "http://127.0.0.1:8000/api/v1/environment/history?range=last_1h"

# Last 24 hours
curl "http://127.0.0.1:8000/api/v1/environment/history?range=last_day"

# Specific date
curl "http://127.0.0.1:8000/api/v1/environment/history?range=date&date=2026-01-10"
```

---

### 7.9 Get Available Dates

**Endpoint**: `GET /api/v1/environment/available-dates`

**Description**: Get list of dates that have readings (aligned to Asia/Colombo timezone days).

**Response** (200):
```json
{
  "dates": [
    "2026-01-08",
    "2026-01-09",
    "2026-01-10"
  ]
}
```

**Usage**: Populate date picker in mobile app for historical date selection.

**cURL Example**:
```bash
curl http://127.0.0.1:8000/api/v1/environment/available-dates
```

---

### 7.10 Get Variety Recommendations

**Endpoint**: `GET /api/v1/environment/recommendation`

**Description**: Get ranked mushroom variety recommendations based on environmental conditions.

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `source` | string | ❌ | `current` | Data source: `current`, `last_1h`, `last_day`, `date` |
| `date` | string (YYYY-MM-DD) | ⚠️ | - | Required when `source=date` |

**Recommendation Algorithm**:
1. Average temperature and humidity from source window
2. Compare against fruiting phase ranges for all mushroom types
3. Calculate penalty score (distance from optimal range)
4. Rank varieties by lowest penalty (best match)
5. Generate explainable reason for each recommendation

**Response** (200) - With Data:
```json
{
  "source": "current",
  "used_stage": "fruiting",
  "temperature": 25.0,
  "humidity": 90.0,
  "points_used": 1,
  "recommendations": [
    {
      "mushroom_type": "Abalone Mushroom",
      "score": 0.5,
      "reason": "Temp within range, RH off by 1.0%"
    },
    {
      "mushroom_type": "Oyster Mushroom",
      "score": 5.0,
      "reason": "Temp off by 5.0°C, RH within range"
    },
    {
      "mushroom_type": "Paddy Straw Mushroom",
      "score": 3.0,
      "reason": "Temp off by 3.0°C, RH off by 5.0%"
    }
  ]
}
```

**Response** (200) - No Data:
```json
{
  "source": "last_day",
  "used_stage": "fruiting",
  "temperature": null,
  "humidity": null,
  "points_used": 0,
  "recommendations": []
}
```

**Scoring Details**:
- Lower score = better match
- Score 0 = perfect match (both temp and humidity in range)
- Temperature penalty: degrees outside range
- Humidity penalty: percentage points outside range

**cURL Examples**:
```bash
# Current reading
curl "http://127.0.0.1:8000/api/v1/environment/recommendation?source=current"

# Last hour average
curl "http://127.0.0.1:8000/api/v1/environment/recommendation?source=last_1h"

# Last day average
curl "http://127.0.0.1:8000/api/v1/environment/recommendation?source=last_day"

# Specific date average
curl "http://127.0.0.1:8000/api/v1/environment/recommendation?source=date&date=2026-01-10"
```

---

## 8. Disease Module

### 8.1 Predict Disease from Image

**Endpoint**: `POST /api/v1/disease/predict`

**Description**: Analyze mushroom image for disease detection using Keras deep learning model.

**Request**:
- **Content-Type**: `multipart/form-data`
- **Form Field**: `file` (JPEG or PNG image)

**Supported Classifications**:
- `healthy` - No disease detected
- `black_mold` - Black mold contamination
- `green_mold` - Green mold/trichoderma contamination
- `invalid_image` - Low confidence (not a mushroom or unclear image)

**Response** (200):
```json
{
  "label": "green_mold",
  "confidence": 0.92
}
```

**Confidence Threshold**:
- Predictions below backend threshold return `invalid_image` label
- Typical threshold: 0.7 (70%)

**Image Requirements**:
- Format: JPEG or PNG
- Recommended size: 224x224 pixels or larger
- Clear, well-lit mushroom image
- Avoid blurry or occluded images

**cURL Example**:
```bash
curl -X POST http://127.0.0.1:8000/api/v1/disease/predict \
  -H "accept: application/json" \
  -F "file=@mushroom_sample.jpg"
```

**Python Example**:
```python
import requests

url = "http://127.0.0.1:8000/api/v1/disease/predict"
files = {"file": open("mushroom_image.jpg", "rb")}
response = requests.post(url, files=files)
print(response.json())
```

**Mobile App Example** (React Native):
```javascript
const formData = new FormData();
formData.append('file', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'mushroom.jpg'
});

const response = await fetch(`${BACKEND_URL}/api/v1/disease/predict`, {
  method: 'POST',
  body: formData,
  headers: {
    'Content-Type': 'multipart/form-data',
  }
});

const result = await response.json();
```

---

## 9. Type Module

### 9.1 Predict Mushroom Type from Image

**Endpoint**: `POST /api/v1/type/predict`

**Description**: Classify mushroom variety from image using TFLite MobileNetV2 model.

**Request**:
- **Content-Type**: `multipart/form-data`
- **Form Field**: `file` (JPEG, PNG, or WEBP image)

**Supported Classifications**:
- Abalone Mushroom
- Button Mushroom
- Milky Mushroom
- Oyster Mushroom
- Paddy Straw Mushroom

**Response** (200) - Confident Prediction:
```json
{
  "ok": true,
  "label": "Oyster Mushroom",
  "confidence": 0.96,
  "top_k": [
    {
      "label": "Oyster Mushroom",
      "confidence": 0.96
    },
    {
      "label": "Abalone Mushroom",
      "confidence": 0.02
    },
    {
      "label": "Milky Mushroom",
      "confidence": 0.01
    }
  ],
  "message": null
}
```

**Response** (200) - Low Confidence / Unknown:
```json
{
  "ok": false,
  "label": "unknown",
  "confidence": 0.62,
  "top_k": [],
  "message": "Not confident (maybe not a mushroom). Please upload a clear mushroom image."
}
```

**Quality Checks**:
- Confidence threshold (typically 0.7)
- Image clarity validation
- Mushroom presence verification

**Image Preprocessing**:
- Resized to 224x224 pixels
- Normalized to [-1, 1] range (MobileNetV2 standard)
- RGB color space

**cURL Example**:
```bash
curl -X POST http://127.0.0.1:8000/api/v1/type/predict \
  -H "accept: application/json" \
  -F "file=@mushroom_type_sample.jpg"
```

**Python Example**:
```python
import requests

url = "http://127.0.0.1:8000/api/v1/type/predict"
files = {"file": open("mushroom.jpg", "rb")}
response = requests.post(url, files=files)
result = response.json()

if result["ok"]:
    print(f"Detected: {result['label']} ({result['confidence']:.2%})")
else:
    print(f"Unknown: {result['message']}")
```

---

## 10. Pests Module

**Status**: 🔄 Placeholder (ready for model integration)

### 10.1 Predict Pest

**Endpoint**: `POST /api/v1/pests/predict`

**Description**: Placeholder endpoint for pest detection. Returns dummy data.

**Request Body**:
```json
{
  "sample_id": "sample-1"
}
```

**Response** (200):
```json
{
  "pest_name": "Dummy Mite",
  "confidence": 0.85,
  "advice": "Increase ventilation and inspect the growing room for visible mites."
}
```

**Future Implementation**:
- Accept image upload (multipart/form-data)
- Return actual pest classifications
- Provide treatment recommendations

**cURL Example**:
```bash
curl -X POST http://127.0.0.1:8000/api/v1/pests/predict \
  -H "Content-Type: application/json" \
  -d '{"sample_id": "test-1"}'
```

---

## 11. Growth Module

**Status**: 🔄 Placeholder (ready for model integration)

### 11.1 Predict Growth Stage

**Endpoint**: `POST /api/v1/growth/predict`

**Description**: Placeholder endpoint for growth prediction. Returns dummy data.

**Request Body**:
```json
{
  "sample_id": "sample-1"
}
```

**Response** (200):
```json
{
  "stage": "pinning",
  "days_until_harvest": 7,
  "expected_yield_kg": 3.2
}
```

**Future Implementation**:
- Accept environmental time series data
- Accept mushroom images for visual stage detection
- Return ML-based yield predictions
- Provide harvest timing recommendations

**cURL Example**:
```bash
curl -X POST http://127.0.0.1:8000/api/v1/growth/predict \
  -H "Content-Type: application/json" \
  -d '{"sample_id": "test-1"}'
```

---

## 12. Data Models

### Reading Model
```json
{
  "id": 1374,
  "sampled_at": "2026-01-10T12:00:00Z",
  "temperature": 25.0,
  "humidity": 95.0,
  "co2_estimated": 900.0,
  "node_id": "esp32-01",
  "note": null
}
```

### Profile Model
```json
{
  "mushroom_type": "Oyster Mushroom",
  "stage": "fruiting",
  "updated_at": "2026-01-10T11:55:00Z"
}
```

### Alert State Model
```json
{
  "param": "temperature",
  "active": true,
  "bad_count": 6,
  "good_count": 0,
  "state_changed_at": "2026-01-10T12:00:00Z",
  "last_value": 28.5,
  "last_message": "Temperature too high! Current 28.5, optimal 19-20."
}
```

### Optimal Range Model
```json
{
  "temp_min": 19.0,
  "temp_max": 20.0,
  "rh_min": 85.0,
  "rh_max": 92.0,
  "co2_min": 600.0,
  "co2_max": 600.0,
  "co2_note": "Estimated only (display)"
}
```

### History Point Model
```json
{
  "ts": "2026-01-10T11:00:00Z",
  "temperature": 25.2,
  "humidity": 91.0,
  "co2": 880.0
}
```

### Recommendation Model
```json
{
  "mushroom_type": "Oyster Mushroom",
  "score": 0.5,
  "reason": "Temp within range, RH off by 1.0%"
}
```

---

## 13. Error Handling

### Standard Error Response Format

All errors follow this structure:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Error Scenarios

**400 Bad Request** - Invalid Profile:
```json
{
  "detail": "No optimal range found for mushroom_type='Invalid Type' and stage='fruiting'"
}
```

**404 Not Found** - Missing Range:
```json
{
  "detail": "No optimal range found for mushroom_type='Unknown' and stage='spawn_run'"
}
```

**415 Unsupported Media Type** - Wrong File Upload:
```json
{
  "detail": "Content-Type must be multipart/form-data for file upload"
}
```

**422 Validation Error** - Pydantic Schema Failure:
```json
{
  "detail": [
    {
      "loc": ["body", "temperature"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**500 Internal Server Error** - Server Exception:
```json
{
  "detail": "Database connection failed"
}
```

### Best Practices for Error Handling

**Client-Side**:
```javascript
try {
  const response = await fetch(`${API_URL}/environment/status`);
  
  if (!response.ok) {
    const error = await response.json();
    console.error(`Error ${response.status}:`, error.detail);
    // Show user-friendly message
    return;
  }
  
  const data = await response.json();
  // Process successful response
} catch (error) {
  console.error('Network error:', error);
  // Handle network failures
}
```

---

## 14. Rate Limiting

### Current Implementation
- **Rate Limiting**: Not implemented in development mode
- **Concurrent Requests**: No limit

### Production Recommendations

**Per-User Limits** (with authentication):
- Reading inserts: 60 per minute
- Status checks: 120 per minute
- Image uploads: 10 per minute
- History queries: 30 per minute

**Per-IP Limits** (without authentication):
- All endpoints: 100 requests per minute
- Image uploads: 5 per minute

**Implementation Suggestion**:
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/v1/environment/readings")
@limiter.limit("60/minute")
async def create_reading(request: Request, ...):
    # Endpoint logic
    pass
```

---

## 15. Database Schema Reference

### Tables Created on Startup

**environment_readings**
- Primary key: `id` (auto-increment)
- Indexes: `sampled_at`, `node_id`
- Stores: all sensor measurements

**environment_profile**
- Single row with `id=1`
- Stores: current mushroom_type and stage
- Updated: via PUT /profile

**environment_alert_state**
- Primary key: `param` (temperature, humidity)
- Stores: alert counters, state, messages
- Reset: when profile changes

**mushroom_stages**
- Reference data: spawn_run, fruiting
- Read-only after seed

**mushroom_optimal_ranges**
- Composite key: mushroom_type + stage
- Stores: temp/humidity/CO₂ ranges
- Seeded: on startup with known varieties

---

## 16. Timezone Handling

All date-based operations use **Asia/Colombo** timezone:

**Affected Endpoints**:
- `GET /history?range=date&date=YYYY-MM-DD`
- `GET /available-dates`
- `GET /recommendation?source=date&date=YYYY-MM-DD`

**Behavior**:
- Date boundaries align to midnight Asia/Colombo time
- UTC timestamps are converted for date grouping
- Returned timestamps remain in UTC

**Example**:
```
Request: /history?range=date&date=2026-01-10

Converts to:
- Start: 2026-01-10 00:00:00 Asia/Colombo → 2026-01-09 18:30:00 UTC
- End:   2026-01-11 00:00:00 Asia/Colombo → 2026-01-10 18:30:00 UTC

Returns: All readings in this UTC range, bucketed hourly
```

---

## 17. Changelog

### Version 1.0.0 (2026-01-10)
- ✅ Initial API release
- ✅ Environment module fully integrated
- ✅ Disease detection integrated (Keras)
- ✅ Type classification integrated (TFLite)
- ✅ Pests and growth placeholder endpoints
- ✅ PostgreSQL backend with connection pooling
- ✅ Consecutive-reading alert logic
- ✅ Asia/Colombo timezone support
- ✅ Interactive Swagger documentation

---

## 18. Support & Contact

For technical questions or bug reports:
- Check Swagger UI: `/docs`
- Review this specification
- Contact research team (see README.md)

**API Maintainer**: IT22353566 - Nipuna Sachintha

---

**Document Version**: 1.0.0  
**Last Updated**: January 10, 2026  
**API Version**: v1
