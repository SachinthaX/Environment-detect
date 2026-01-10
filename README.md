# Smart Mushroom Cultivation Analytics Framework

A comprehensive IoT-enabled decision-support system for mushroom cultivation that combines real-time environmental monitoring, AI-powered disease detection, and intelligent variety recommendations to help small and medium-scale farmers optimize yields and reduce losses.

![Project Banner](./docs/images/banner.jpeg)

<p align="center">
  <b>Environmental Monitoring</b> • <b>AI Disease Detection</b> • <b>Growth Prediction</b>
</p>

<p align="center">
  A comprehensive IoT-enabled decision-support system for mushroom cultivation...
</p>

## 🍄 Overview

Mushroom cultivation is highly sensitive to environmental conditions—particularly temperature and relative humidity. Manual monitoring often misses critical deviations that can lead to contamination or reduced yields. This system provides an intelligent, automated solution with real-time alerts, trend analysis, and AI-powered insights.

### What This System Offers

**Environmental Intelligence**
- Real-time monitoring of temperature, humidity, and CO₂ levels
- Smart alerts with consecutive-reading logic to prevent false alarms
- Historical trend analysis with customizable time ranges
- Sensor health monitoring and offline detection

**AI-Powered Analysis**
- Disease detection from mushroom images (healthy, black mold, green mold)
- Mushroom variety classification via image recognition
- Intelligent variety recommendations based on current conditions
- Explainable scoring system for decision transparency

**Optimized Cultivation**
- Pre-loaded optimal ranges for multiple mushroom varieties
- Stage-specific monitoring (spawn run vs. fruiting phase)
- Visual trend graphs aligned to local timezone (Asia/Colombo)
- Mobile-first interface for on-the-go management

---

## 🏗️ Architecture

```mermaid
flowchart TB
    subgraph IoT["IoT Layer (Optional)"]
        ESP[ESP32 + DHT22 + MQ-135]
    end
    
    subgraph Mobile["Mobile Application"]
        UI1[Environmental Dashboard]
        UI2[Disease Detection]
        UI3[Type Classification]
        UI4[Recommendations]
    end
    
    subgraph Backend["FastAPI Backend"]
        API[REST API Layer]
        ENV[Environment Service]
        DIS[Disease AI Service]
        TYP[Type AI Service]
        REC[Recommendation Engine]
    end
    
    subgraph Storage["Data Layer"]
        DB[(PostgreSQL)]
        ML1[Keras Disease Model]
        ML2[TFLite Type Model]
    end
    
    IoT -->|HTTP POST| API
    Mobile -->|REST API| API
    API --> ENV
    API --> DIS
    API --> TYP
    API --> REC
    ENV <--> DB
    DIS --> ML1
    TYP --> ML2
```

---

## 🚀 Key Features

### 1. Real-Time Environmental Monitoring
- **Multi-sensor support**: Temperature (°C), Humidity (%RH), CO₂ (ppm estimated)
- **Live status dashboard**: Current readings with optimal range comparison
- **Sensor health tracking**: Online/offline status with last-seen timestamps
- **Node identification**: Support for multiple sensor nodes

### 2. Intelligent Alert System
Reduces false alarms using a consecutive-reading algorithm:
- **Alert activation**: 6 consecutive out-of-range readings required
- **Alert deactivation**: 2 consecutive in-range readings required
- **Persistent state**: Alert counters and messages stored in database
- **Parameter-specific**: Independent alerts for temperature and humidity

### 3. Historical Trend Analysis
Fixed-bucket time series data for consistent visualization:
- **Last 1 Hour**: 12 data points (5-minute intervals)
- **Last 24 Hours**: 24 data points (hourly intervals)
- **Specific Date**: 24 hourly points aligned to Asia/Colombo timezone
- **Suggested axis ranges**: Temperature (0–45°C), Humidity (0–100%), CO₂ (0–5000 ppm)

### 4. Variety Recommendation Engine
- **Intelligent matching**: Ranks mushroom varieties by environmental fit
- **Explainable scoring**: Distance-based penalties from optimal ranges
- **Multiple data sources**: Current reading, hourly average, daily average, or specific date
- **Stage-aware**: Considers spawn run vs. fruiting phase requirements

### 5. AI Disease Detection
- **Keras-based model**: Pre-trained on mushroom disease images
- **Three classifications**: Healthy, Black Mold, Green Mold
- **Confidence thresholding**: Returns "invalid_image" for low-confidence predictions
- **Mobile integration**: Direct camera/gallery upload from app

### 6. AI Type Classification
- **TFLite model**: Lightweight MobileNetV2-based classifier
- **Five varieties**: Abalone, Button, Milky, Oyster, Paddy Straw mushrooms
- **Quality checks**: Rejects unclear or non-mushroom images
- **Top-K predictions**: Returns confidence scores for multiple varieties

---

## 🛠️ Technology Stack

### Backend
| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | FastAPI | High-performance async REST API |
| **Database** | PostgreSQL 13+ | Relational data storage with JSON support |
| **DB Driver** | psycopg[binary] + psycopg_pool | Connection pooling and async support |
| **ML Framework** | TensorFlow/Keras | Disease model inference |
| **Lite Inference** | TFLite Interpreter | Efficient mobile-optimized classification |
| **Image Processing** | Pillow, NumPy | Image preprocessing and manipulation |
| **Timezone** | tzdata | Asia/Colombo timezone support |
| **File Upload** | python-multipart | Multipart form data handling |
| **Environment** | python-dotenv | Configuration management |
| **Server** | Uvicorn | ASGI server with hot reload |

### Mobile Application
| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | Expo + React Native | Cross-platform mobile development |
| **Navigation** | React Navigation | Bottom tab navigation |
| **Image Capture** | expo-image-picker | Camera and gallery access |
| **Charts** | react-native-svg | Vector-based trend visualization |
| **Icons** | @expo/vector-icons | UI iconography |
| **HTTP Client** | Fetch API | Backend communication |

### Hardware (Optional IoT Integration)
- **Microcontroller**: ESP32 DevKit (WiFi enabled)
- **Temperature/Humidity**: DHT22 digital sensor
- **CO₂ Estimation**: MQ-135 analog gas sensor
- **Communication**: HTTP REST API over WiFi

---

## 📁 Repository Structure

```
Research-Project-Of-Mushroom/
├── backend/
│   ├── main.py                          # FastAPI application entry point
│   ├── requirements.txt                 # Python dependencies
│   ├── .env.example                     # Environment variable template
│   ├── models/                          # AI model files
│   │   ├── mushroom_disease_model.h5    # Keras disease detection model
│   │   ├── mushroom_type.tflite         # TFLite type classification model
│   │   └── class_names.json             # Type model class labels
│   └── app/
│       ├── api/v1/                      # API route handlers
│       │   ├── environment.py           # Environmental endpoints
│       │   ├── disease.py               # Disease prediction endpoints
│       │   ├── type.py                  # Type classification endpoints
│       │   ├── pests.py                 # Pest detection (placeholder)
│       │   └── growth.py                # Growth prediction (placeholder)
│       ├── db/                          # Database layer
│       │   ├── connection.py            # PostgreSQL connection pool
│       │   └── seed.py                  # Database initialization and seeding
│       ├── schemas/                     # Pydantic models
│       │   ├── environment.py           # Environment data schemas
│       │   ├── disease.py               # Disease prediction schemas
│       │   └── type.py                  # Type prediction schemas
│       └── services/                    # Business logic
│           ├── environment_service.py   # Environmental monitoring logic
│           ├── disease_service.py       # Disease detection inference
│           └── type_service.py          # Type classification inference
│
├── MobileAppExpo/
│   ├── App.js                           # Application entry point
│   ├── package.json                     # Node dependencies
│   ├── app.json                         # Expo configuration
│   └── src/
│       ├── screens/                     # UI screens
│       │   ├── EnvironmentScreen.js     # Main dashboard
│       │   ├── DiseaseScreen.js         # Disease detection
│       │   ├── TypeScreen.js            # Type classification
│       │   └── RecommendationScreen.js  # Variety recommendations
│       └── services/
│           └── api.js                   # Backend API client
│
└── docs/
    ├── README.md                        # This file
    └── api_spec.md                      # Detailed API documentation
```

---

## 🚦 Quick Start Guide

### Prerequisites
- **Python**: 3.10 or higher (3.11 recommended)
- **PostgreSQL**: 13 or higher
- **Node.js**: 16 or higher
- **npm**: 8 or higher
- **Expo Go**: Mobile app (for testing)

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
pip install python-dotenv
```

4. **Configure database**

Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/mushroom_db
```

Replace `username`, `password`, and `mushroom_db` with your PostgreSQL credentials.

5. **Initialize database**

The backend automatically creates and seeds tables on first run. Ensure PostgreSQL is running and the database exists:
```sql
CREATE DATABASE mushroom_db;
```

6. **Start the backend server**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

7. **Verify installation**
- Swagger UI: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/ping
- API status: http://127.0.0.1:8000/api/v1/environment/health

### Mobile App Setup

1. **Navigate to mobile directory**
```bash
cd MobileAppExpo
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure backend URL**

Edit `MobileAppExpo/src/services/api.js`:
```javascript
// For development, use your computer's local IP address
// Find it with: ipconfig (Windows) or ifconfig (macOS/Linux)
export const BACKEND_URL = "http://192.168.1.100:8000";
```

**Important**: Both your development machine and mobile device must be on the same WiFi network.

4. **Start Expo development server**
```bash
npx expo start
```

5. **Launch on device**
- Install **Expo Go** from your device's app store
- Scan the QR code displayed in your terminal
- The app will build and launch automatically

---

## 🧪 Testing the System

### Backend API Tests

**Health Check**
```bash
curl http://127.0.0.1:8000/ping
```

**Get Current Status**
```bash
curl http://127.0.0.1:8000/api/v1/environment/status
```

**Insert Test Reading**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/environment/readings \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 25.0,
    "humidity": 90.0,
    "co2": 800.0,
    "node_id": "test-node"
  }'
```

**Get Historical Data**
```bash
# Last hour
curl http://127.0.0.1:8000/api/v1/environment/history?range=last_1h

# Last 24 hours
curl http://127.0.0.1:8000/api/v1/environment/history?range=last_day

# Specific date
curl http://127.0.0.1:8000/api/v1/environment/history?range=date&date=2026-01-10
```

**Get Variety Recommendations**
```bash
# Based on current reading
curl http://127.0.0.1:8000/api/v1/environment/recommendation?source=current

# Based on last day average
curl http://127.0.0.1:8000/api/v1/environment/recommendation?source=last_day
```

**Update Cultivation Profile**
```bash
curl -X PUT http://127.0.0.1:8000/api/v1/environment/profile \
  -H "Content-Type: application/json" \
  -d '{
    "mushroom_type": "Oyster Mushroom",
    "stage": "fruiting"
  }'
```

**Disease Detection**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/disease/predict \
  -F "file=@path/to/mushroom_image.jpg"
```

**Type Classification**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/type/predict \
  -F "file=@path/to/mushroom_image.jpg"
```

---

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env`:
```env
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database

# Optional: Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# Optional: Alert Configuration
ALERT_BAD_COUNT_THRESHOLD=6
ALERT_GOOD_COUNT_THRESHOLD=2

# Optional: Model Paths (if different from defaults)
DISEASE_MODEL_PATH=models/mushroom_disease_model.h5
TYPE_MODEL_PATH=models/mushroom_type.tflite
CLASS_NAMES_PATH=models/class_names.json
```

### Mobile App Configuration

Edit `MobileAppExpo/src/services/api.js`:
```javascript
// Development (same WiFi network)
export const BACKEND_URL = "http://YOUR_PC_IP:8000";

// Production (deployed backend)
export const BACKEND_URL = "https://your-domain.com";
```

---

## 📊 Database Schema

The system automatically creates and seeds the following tables:

**environment_readings**
- Stores all sensor measurements with timestamps
- Includes temperature, humidity, CO₂, node_id, and optional notes

**environment_profile**
- Single-row table storing current mushroom type and cultivation stage
- Updated via PUT /api/v1/environment/profile

**environment_alert_state**
- Tracks alert state for temperature and humidity
- Maintains consecutive reading counters and last alert messages

**mushroom_stages**
- Reference table for cultivation stages (spawn_run, fruiting)

**mushroom_optimal_ranges**
- Pre-seeded optimal environmental ranges
- Organized by mushroom type and cultivation stage

---

## 👥 Research Team

This project is developed as part of academic research at SLIIT.

| Student ID | Name | Research Focus |
|------------|------|----------------|
| IT22889188 | Dhananjaya S.M.A | Disease detection AI model development |
| IT22353566 | Sachintha H.N    | Environmental monitoring, alerts, recommendation engine, system integration |
| IT22911162 | Yukthila Y.C     | Growth prediction research |

---

## 📚 Documentation

- **API Specification**: See [docs/api_spec.md](docs/api_spec.md) for complete endpoint documentation
- **Swagger UI**: Available at http://127.0.0.1:8000/docs when backend is running
- **ReDoc**: Available at http://127.0.0.1:8000/redoc for alternative API documentation

---

## 🔮 Future Enhancements

- **Pest Detection**: AI model integration for pest identification (endpoint ready)
- **Growth Prediction**: ML-based yield forecasting (endpoint ready)
- **Multi-user Support**: Authentication and user-specific profiles
- **Cloud Deployment**: Production-ready deployment guides
- **WebSocket Support**: Real-time data streaming for live dashboards
- **Notification System**: Push notifications for critical alerts
- **Data Export**: CSV/Excel export for historical data analysis
- **Advanced Analytics**: Correlation analysis between environmental factors and yields

---

## 📄 License

This project is developed for academic research purposes at SLIIT (Sri Lanka Institute of Information Technology).

---

## 🤝 Contributing

This is a research project. For questions or collaboration inquiries, please contact the research team members listed above.

---

## 🐛 Troubleshooting

**Backend won't start**
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format in .env file
- Ensure Python version is 3.10+

**Mobile app can't connect**
- Confirm both devices are on same WiFi network
- Check firewall isn't blocking port 8000
- Verify backend URL uses local IP, not localhost
- Test backend accessibility: `curl http://YOUR_IP:8000/ping` from another device

**Database connection errors**
- Verify database exists: `psql -l`
- Check user permissions
- Ensure password doesn't contain special characters that need escaping in URL

**AI models not loading**
- Verify model files exist in `backend/models/` directory
- Check file permissions are readable
- Confirm TensorFlow installation: `pip show tensorflow`

---

**Last Updated**: January 10, 2026  
**Version**: 1.0.0  
**Status**: Active Development
