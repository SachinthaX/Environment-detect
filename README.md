# 🍄 Smart Mushroom Cultivation Analytics Framework

<div align="center">

```
🍄🌱🔬 SMART MUSHROOM CULTIVATION ANALYTICS FRAMEWORK 🔬🌱🍄
═══════════════════════════════════════════════════════════════════════════════════
🤖 AI-Powered • 📊 Data-Driven • 🌿 Sustainable Agriculture Innovation
═══════════════════════════════════════════════════════════════════════════════════
```

[![Project ID](https://img.shields.io/badge/Project--ID-25--26J--211-blue?style=for-the-badge)](.)
[![Status](https://img.shields.io/badge/Status-In%20Development-green?style=for-the-badge)](.)
[![Institution](https://img.shields.io/badge/Institution-SLIIT,%20Sri%20Lanka-darkgreen?style=for-the-badge)](.)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE.md)

**An AI-powered decision support framework for optimizing mushroom cultivation using environment monitoring, computer vision, and predictive analytics.**

[📋 Features](#-key-features) • [🚀 Quick Start](#-quick-start) • [👥 Team](#-research-team--authors) • [🛠 Tech Stack](#-technology-stack) • [🏗 Architecture](#-project-architecture) • [📚 Docs](#-documentation)

</div>

---

## 🎯 Project Overview

This research project implements an integrated **IoT + AI** ecosystem for mushroom cultivation. The system is a comprehensive decision-support platform that helps farmers monitor and manage:

- **Growing environment and pest-related issues** – Real-time monitoring with intelligent recommendations
- **Mushroom diseases** – Early detection and treatment guidance
- **Growth stages and expected yield** – Predictive analytics for harvest optimization
- **Mobile-first decision support** – Accessible via Android devices through an intuitive app

### Current Implementation Status

The project currently features a **fully functional end-to-end system** with:

- ✅ **FastAPI backend** exposing REST APIs for all four core modules
- ✅ **Expo React Native mobile app** running on Android devices via Expo Go
- ✅ **Modular architecture** ready for multi-developer collaboration
- ✅ **Working API endpoints** with dummy data (ready for ML model integration)
- 🔄 **Planned integration** with ML models (Google Colab) and IoT sensors (ESP32)

### 🌟 Vision Statement

> "Empowering mushroom growers with intelligent technology to maximize yield, minimize losses, and ensure sustainable cultivation practices through data-driven decision making."

---

## 🏆 Key Features

<table>
<tr>
<td width="50%">

### 🌡️ Environment Monitoring
**Status:** ✅ Backend + Mobile UI Ready

- Real-time environment status API
- Temperature, humidity, CO₂, ammonia tracking
- Intelligent recommendations engine
- Mobile dashboard for instant insights

</td>
<td width="50%">

### 🦟 Pest Detection System
**Status:** ⚙️ API Skeleton Ready

- Pest identification endpoints
- Confidence scoring system
- Treatment advice delivery
- Mobile screen wired to backend

</td>
</tr>
<tr>
<td width="50%">

### 🔬 Disease Detection & Treatment
**Status:** ⚙️ API Skeleton Ready

- Disease prediction API
- Severity level assessment
- Treatment recommendation system
- Mobile interface for results display

</td>
<td width="50%">

### 📈 Growth Stage Prediction
**Status:** ⚙️ API Skeleton Ready

- Growth stage classification
- Harvest timing estimation
- Expected yield prediction
- Timeline optimization tools

</td>
</tr>
</table>

### 🚀 Planned Features

- **ML Model Integration** – TensorFlow/PyTorch models from Google Colab
- **IoT Sensor Network** – ESP32-based real-time data collection
- **Advanced Analytics** – Historical data analysis and trend prediction
- **Cultivation Planning** – Budget estimation and resource optimization
- **Smart Notifications** – Proactive alerts and actionable insights

---

## 👥 Research Team & Authors

Our multidisciplinary research team brings together expertise in AI, IoT, computer vision, and agricultural technology:

<details>
<summary><strong>🔬 Component 1: Visual Disease Detection & Treatment System</strong></summary>

**Lead Researcher:** [Dhananjaya S.M.A](mailto:it22889188@my.sliit.lk)  
**Student ID:** IT22889188  
**Program:** BSc (Hons) in Information Technology Specializing in Information Technology  

**Research Focus:**
- Artificial Neural Network (ANN) architectures for automated disease detection  
- Computer vision for identifying black mold, green mold, soft rot, etc.  
- Knowledge-based expert systems for treatment recommendation  
- Preventive management protocol development  

**Technologies:** TensorFlow, OpenCV, Python, Deep Learning, Image Processing  

**API Endpoints:**
- `POST /api/v1/disease/predict` – Disease identification and treatment advice

</details>

<details>
<summary><strong>🌡️ Component 2: Environmental Monitoring & Pest Detection System</strong></summary>

**Lead Researcher:** [Nipuna Sachintha](mailto:it22353566@my.sliit.lk)  
**Student ID:** IT22353566  
**Program:** BSc (Hons) in Information Technology Specializing in Information Technology  

**Research Focus:**
- IoT sensor network architecture using ESP32 microcontrollers  
- Real-time monitoring of temperature, humidity, and CO₂ levels  
- CNN-based models for Sri Lankan pest identification  
- Variety recommendation based on environmental patterns  

**Technologies:** ESP32, IoT Sensors, TensorFlow, Edge Computing, Cloud Integration  

**API Endpoints:**
- `GET /api/v1/environment/status` – Real-time environment readings
- `GET /api/v1/environment/recommendation` – Environment control recommendations
- `POST /api/v1/pests/predict` – Pest identification and management advice

</details>

<details>
<summary><strong>📊 Component 3: Visual Growth Stage & Type Classification</strong></summary>

**Lead Researcher:** [Yakupitiyage Chamath Yukthila](mailto:it22911162@my.sliit.lk)  
**Student ID:** IT22911162  
**Program:** BSc (Hons) in Information Technology Specializing in Information Technology  

**Research Focus:**
- Multi-class mushroom variety classification (Oyster, Button, Milky, etc.)  
- Time-series analysis for growth stage prediction  
- Computer vision for spawn run, primordia, fruitbody development  
- Predictive modeling for cultivation timeline optimization  

**Technologies:** Deep Learning, Computer Vision, Time-Series Analysis, Pattern Recognition  

**API Endpoints:**
- `POST /api/v1/growth/predict` – Growth stage classification and yield prediction

</details>

<details>
<summary><strong>🚜 Component 4: Mushroom Harvesting Optimization System</strong></summary>

**Lead Researcher:** [Sachindra K.T.N.](mailto:it22350350@my.sliit.lk)  
**Student ID:** IT22350350  
**Program:** BSc (Hons) in Information Technology Specializing in Information Technology  

**Research Focus:**
- Ripeness detection through image analysis  
- Quality grading algorithms for size and appearance  
- Harvest window prediction and optimization  
- User-centric cultivation planning tools  

**Technologies:** Machine Learning, Image Processing, Optimization Algorithms, Mobile Development  

**API Endpoints:**
- `POST /api/v1/growth/predict` – Harvest timing and quality assessment

</details>

---

## 🛠 Technology Stack

### Backend
- **Framework:** FastAPI (REST API)
- **Server:** Uvicorn (ASGI)
- **Language:** Python 3.10+
- **Validation:** Pydantic schemas
- **Future:** SQL/NoSQL database integration

### Mobile Application
- **Framework:** React Native
- **Platform:** Expo (development & deployment)
- **Navigation:** React Navigation (bottom tabs)
- **Target:** Android devices (Expo Go)

### Machine Learning & AI (Planned)
- **Training:** Google Colab notebooks
- **Frameworks:** TensorFlow / PyTorch
- **Vision:** OpenCV for image processing
- **Analysis:** scikit-learn for data analysis

### Hardware & IoT (Planned)
- **Microcontroller:** ESP32
- **Sensors:** Temperature, Humidity, CO₂, Ammonia
- **Camera:** Image capture modules
- **Communication:** Wi-Fi/MQTT protocols

---

## 🚀 Quick Start

This project consists of **two main components** that work together in a client-server architecture:

1. **Backend** (`backend/`) – FastAPI server exposing REST APIs
2. **Mobile App** (`MobileAppExpo/`) – Expo React Native application

### Prerequisites

**For Backend:**
- Python 3.10 or higher
- pip (Python package manager)
- Virtual environment support (recommended)

**For Mobile App:**
- Node.js (v14 or higher) + npm
- Expo CLI (via npx)
- Expo Go app on Android device
- PC and phone on the **same Wi-Fi network**

---

### 1. Clone the Repository

```bash
git clone https://github.com/abheethasma/Research-Project-Of-Mushroom.git
cd Research-Project-Of-Mushroom
```

---

### 2. Backend Setup (FastAPI)

#### Step 1: Navigate to backend directory

```bash
cd backend
```

#### Step 2: Create and activate virtual environment

```bash
# Create virtual environment (first time only)
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\activate
# Windows (Command Prompt):
venv\Scripts\activate.bat
# macOS/Linux:
source venv/bin/activate
```

#### Step 3: Install dependencies

```bash
pip install -r requirements.txt
```

#### Step 4: Run the backend server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Important Notes:**
- `--host 0.0.0.0` allows devices on the local network to connect (required for mobile app)
- `--reload` enables auto-restart on code changes (development mode)
- `--port 8000` specifies the port (default)

#### Step 5: Verify backend is running

The backend will be accessible at:
- **Local machine:** `http://127.0.0.1:8000`
- **Local network:** `http://<YOUR_PC_IPV4>:8000`

To find your PC's IPv4 address:
- **Windows:** Run `ipconfig` in Command Prompt (look for IPv4 Address under your active network)
- **macOS/Linux:** Run `ifconfig` or `ip addr` in Terminal

**Test the backend:**
- Open browser and visit: `http://127.0.0.1:8000/ping`
- Expected response: `{"message": "Backend is working!"}`

---

### 3. Mobile App Setup (Expo + React Native)

#### Step 1: Navigate to mobile app directory

```bash
cd MobileAppExpo
```

#### Step 2: Install dependencies

```bash
npm install
```

#### Step 3: Configure backend URL

Edit the file `MobileAppExpo/src/services/api.js`:

```javascript
// Replace with your PC's IPv4 address from ipconfig/ifconfig
export const BACKEND_URL = 'http://192.168.8.137:8000';  // CHANGE THIS
```

**⚠️ Critical:** Replace `192.168.8.137` with your actual PC IPv4 address obtained in the backend setup step.

#### Step 4: Start Expo development server

```bash
npx expo start
```

This will:
- Start the Metro bundler
- Generate a QR code in the terminal/browser
- Open the Expo developer tools in your browser

#### Step 5: Run on Android device

1. Open **Expo Go** app on your Android device
2. Ensure your phone is on the **same Wi-Fi network** as your PC
3. Scan the QR code displayed in the terminal/browser
4. The app will download and launch on your device

---

### 4. Using the Application

The app features a **bottom tab navigation** with five screens:

#### 🏠 Home Screen
- Tests basic backend connectivity
- Calls: `GET /ping` and `POST /predict`
- Displays dummy prediction results

#### 🌡️ Environment Screen
- Shows real-time environment status
- Displays: Temperature, Humidity, CO₂, Ammonia levels
- Provides intelligent recommendations
- Calls: `GET /api/v1/environment/status` and `/recommendation`

#### 🦟 Pests Screen
- Pest detection interface (ready for implementation)
- Calls: `POST /api/v1/pests/predict`
- Currently returns dummy pest identification data

#### 🔬 Disease Screen
- Disease detection and diagnosis
- Shows: Disease name, confidence, severity, treatment
- Calls: `POST /api/v1/disease/predict`

#### 📈 Growth Screen
- Growth stage prediction interface (ready for implementation)
- Displays: Growth stage, days to harvest, expected yield
- Calls: `POST /api/v1/growth/predict`

**Note:** All endpoints currently return dummy data but are fully functional and ready for ML model integration.

---

## 📂 Project Architecture

### Repository Structure

```
Research-Project-Of-Mushroom/
│
├── backend/                          # FastAPI backend application
│   ├── main.py                      # FastAPI app entrypoint & CORS config
│   ├── requirements.txt             # Python dependencies
│   └── app/
│       ├── __init__.py
│       ├── api/
│       │   ├── __init__.py
│       │   └── v1/
│       │       ├── __init__.py
│       │       ├── environment.py   # Environment monitoring routes
│       │       ├── pests.py         # Pest detection routes
│       │       ├── disease.py       # Disease detection routes
│       │       └── growth.py        # Growth prediction routes
│       ├── schemas/
│       │   ├── __init__.py
│       │   ├── environment.py       # Environment data models
│       │   ├── pests.py             # Pest data models
│       │   ├── disease.py           # Disease data models
│       │   └── growth.py            # Growth data models
│       ├── services/
│       │   ├── __init__.py
│       │   ├── environment_service.py  # Environment business logic
│       │   ├── pests_service.py        # Pest detection logic
│       │   ├── disease_service.py      # Disease detection logic
│       │   └── growth_service.py       # Growth prediction logic
│       ├── models/
│       │   └── __init__.py          # (Planned) ML model loading
│       └── core/
│           └── __init__.py          # (Planned) Config, DB, utilities
│
├── MobileAppExpo/                   # React Native mobile application
│   ├── App.js                       # Root component & navigation setup
│   ├── app.json                     # Expo configuration
│   ├── package.json                 # Node dependencies
│   └── src/
│       ├── screens/
│       │   ├── HomeScreen.js              # Home & connectivity tests
│       │   ├── EnvironmentScreen.js       # Environment monitoring UI
│       │   ├── PestDetectionScreen.js     # Pest detection UI
│       │   ├── DiseaseDetectionScreen.js  # Disease detection UI
│       │   └── GrowthPredictionScreen.js  # Growth prediction UI
│       └── services/
│           ├── api.js               # Backend URL & shared utilities
│           ├── environmentApi.js    # Environment API client
│           ├── pestApi.js           # Pest API client
│           ├── diseaseApi.js        # Disease API client
│           └── growthApi.js         # Growth API client
│
├── ml/                              # (Planned) Machine learning resources
│   ├── notebooks/                   # Google Colab training notebooks
│   ├── models/                      # Exported trained models
│   └── scripts/                     # Training & evaluation scripts
│
├── iot/                             # (Planned) IoT hardware & firmware
│   ├── esp32/                       # ESP32 firmware code
│   ├── sensors/                     # Sensor integration code
│   └── docs/                        # Hardware setup documentation
│
├── docs/                            # Project documentation
│   ├── api_spec.md                  # API endpoint specifications
│   ├── setup_guide.md               # (Planned) Detailed setup guide
│   └── user_manual.md               # (Planned) End-user documentation
│
├── scripts/                         # (Planned) Utility scripts
│   ├── deploy.sh                    # Deployment automation
│   └── data_import.py               # Data management utilities
│
├── assets/                          # Project assets
│   └── mushroom-header1.png         # README banner image
│
├── README.md                        # This file
└── LICENSE.md                       # Project license
```

### Architecture Diagram

```
┌─────────────────┐
│  Mobile App     │  (React Native + Expo)
│  (Android)      │  
└────────┬────────┘
         │ HTTP/REST
         │ (Local Network)
         ▼
┌─────────────────┐
│  FastAPI        │  (Python Backend)
│  Backend        │  
├─────────────────┤
│ • Environment   │
│ • Pests         │
│ • Disease       │
│ • Growth        │
└────────┬────────┘
         │
         ├──► (Future) ML Models (TensorFlow/PyTorch)
         │
         └──► (Future) IoT Sensors (ESP32 + Sensors)
```

---

## 🔌 API Endpoints Reference

### General Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/ping` | Health check | None | `{"message": "Backend is working!"}` |
| POST | `/predict` | Test prediction | `{"value": number}` | `{"prediction": number}` |

### Environment Module (`/api/v1/environment`)

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/status` | Get current environment readings | Temperature, humidity, CO₂, ammonia levels |
| GET | `/recommendation` | Get environment recommendations | Status and advice text |

### Pests Module (`/api/v1/pests`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/predict` | Predict pest type | `{"sample_id": "string"}` | Pest name, confidence, advice |

### Disease Module (`/api/v1/disease`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/predict` | Predict disease | `{"sample_id": "string"}` | Disease name, confidence, severity, treatment |

### Growth Module (`/api/v1/growth`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/predict` | Predict growth stage | `{"sample_id": "string"}` | Growth stage, days to harvest, expected yield |

**Note:** All endpoints currently return dummy data for testing. Real ML model integration is planned.

---

## 👨‍💻 Development Workflow

### For Team Members

This project is designed for **parallel development** by multiple team members working on different components:

#### Component Split

1. **Environment & Pest Detection** (Nipuna Sachintha)
   - Branch: `feature/environment-pests`
   - Focus: Environment monitoring, IoT integration, pest detection ML

2. **Disease Detection** (Dhananjaya S.M.A)
   - Branch: `feature/disease-detection`
   - Focus: Disease classification ML, treatment recommendations

3. **Growth Prediction** (Chamath Yukthila)
   - Branch: `feature/growth-prediction`
   - Focus: Growth stage classification, yield prediction

4. **Harvesting Optimization** (Sachindra K.T.N.)
   - Branch: `feature/harvest-optimization`
   - Focus: Quality grading, harvest timing, mobile UI enhancements

### Development Guidelines

1. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/your-component-name
   ```

2. **Make your changes** in the appropriate directories:
   - Backend logic: `backend/app/services/`
   - API routes: `backend/app/api/v1/`
   - Mobile screens: `MobileAppExpo/src/screens/`
   - API clients: `MobileAppExpo/src/services/`

3. **Test locally** with both backend and mobile app running

4. **Commit with clear messages**
   ```bash
   git commit -m "Add disease detection ML model integration"
   ```

5. **Push and create Pull Request**
   ```bash
   git push origin feature/your-component-name
   ```

### Code Style & Best Practices

- **Backend:** Follow PEP 8 for Python code
- **Mobile:** Use ES6+ JavaScript, functional components with hooks
- **Comments:** Document complex logic and API contracts
- **Testing:** Test all endpoints before committing
- **API:** Maintain backward compatibility when modifying endpoints

---

## 🤝 Contributing

We welcome contributions from the team and, in the future, the broader community.

### Types of Contributions

- 🧠 **ML Model Integration** – Implement trained models in the backend services
- 🔌 **IoT Integration** – Connect ESP32 sensors to the environment module
- 📱 **Mobile UI/UX** – Enhance the mobile app interface and user experience
- 📊 **Data Analysis** – Improve prediction algorithms and accuracy
- 📚 **Documentation** – Expand guides, API docs, and user manuals
- 🐛 **Bug Fixes** – Report and fix issues
- ✨ **Feature Requests** – Suggest and implement new features

### Contribution Workflow

1. Fork the repository (for external contributors)
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request with a clear description

---

## 📚 Documentation

### Available Documentation

- **[API Specification](docs/api_spec.md)** – Complete API endpoint reference with examples
- **README.md** (this file) – Project overview and quick start guide

### Planned Documentation

- **Setup Guide** – Detailed environment setup for all platforms
- **Model Documentation** – ML model architectures and training procedures
- **User Manual** – End-user guide for mushroom farmers
- **Developer Guide** – In-depth technical documentation
- **IoT Setup Guide** – Hardware assembly and firmware installation
- **Deployment Guide** – Production deployment procedures

---

## 🧪 Testing

### Backend Testing

```bash
cd backend
pytest  # (once test suite is implemented)
```

### Mobile App Testing

- **Development:** Use Expo Go for live testing on physical devices
- **Production:** Build standalone APK/AAB for Android
  ```bash
  npx expo build:android
  ```

### API Testing

Use tools like:
- **Postman** – Interactive API testing
- **curl** – Command-line testing
- **FastAPI Docs** – Built-in Swagger UI at `http://127.0.0.1:8000/docs`

---

## 🚀 Deployment

### Backend Deployment (Planned)

- **Cloud Platforms:** AWS, Google Cloud, Azure, or DigitalOcean
- **Containerization:** Docker + Docker Compose
- **Database:** PostgreSQL or MongoDB integration
- **API Gateway:** Nginx reverse proxy

### Mobile App Deployment

- **Android:** Build APK via Expo and distribute via Google Play Store
- **Updates:** Use Expo's over-the-air (OTA) updates for rapid deployment

---

## 📊 Project Status & Roadmap

### ✅ Completed (v0.1 - Initial Setup)

- [x] FastAPI backend with modular architecture
- [x] Four core API modules (Environment, Pests, Disease, Growth)
- [x] React Native mobile app with Expo
- [x] Bottom tab navigation with five screens
- [x] Backend-to-mobile communication over local network
- [x] Dummy endpoints for all modules
- [x] API service layer for mobile app

### 🔄 In Progress

- [ ] ML model training in Google Colab
- [ ] Model export and backend integration
- [ ] ESP32 sensor network setup
- [ ] Real-time data collection and processing

### 📋 Planned (Future Releases)

- [ ] Database integration (user data, history, analytics)
- [ ] User authentication and authorization
- [ ] Push notifications for alerts
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Cloud deployment
- [ ] iOS app support
- [ ] Web dashboard for farmers

---

## 📄 License & Citation

This project is intended to be released under the **MIT License**. See [LICENSE.md](LICENSE.md) for details (once added).

### Academic Citation

If you use this work in your research or reference it in academic publications, please cite:

```bibtex
@misc{smart_mushroom_framework_2025,
  title={Smart Mushroom Cultivation Analytics Framework: An AI-Powered Approach to Optimized Farming},
  author={Dhananjaya, S.M.A and Sachintha, Nipuna and Yukthila, Chamath and Sachindra, K.T.N.},
  year={2025},
  institution={Sri Lanka Institute of Information Technology (SLIIT)},
  note={Project ID: 25-26J-211},
  url={https://github.com/abheethasma/Research-Project-Of-Mushroom}
}
```

---

## 🙏 Acknowledgments

- **Sri Lanka Institute of Information Technology (SLIIT)** – For institutional support and research facilities
- **Faculty of Computing** – For guidance, mentorship, and academic resources
- **Local Mushroom Farmers** – For domain expertise and practical insights
- **Open-Source Community** – Python, FastAPI, React Native, TensorFlow, and all the amazing tools that make this possible

### Special Thanks

- Our project supervisors for continuous guidance
- Beta testers providing valuable feedback
- Contributors to the ML model datasets

---

## 📞 Contact & Support

### Research Team Contacts

- **Dhananjaya S.M.A** – [it22889188@my.sliit.lk](mailto:it22889188@my.sliit.lk) (Disease Detection)
- **Nipuna Sachintha** – [it22353566@my.sliit.lk](mailto:it22353566@my.sliit.lk) (Environment & Pests)
- **Chamath Yukthila** – [it22911162@my.sliit.lk](mailto:it22911162@my.sliit.lk) (Growth Prediction)
- **Sachindra K.T.N.** – [it22350350@my.sliit.lk](mailto:it22350350@my.sliit.lk) (Harvest Optimization)

### Issues & Bugs

Please report issues via [GitHub Issues](https://github.com/abheethasma/Research-Project-Of-Mushroom/issues)

---

## 🔗 Related Links

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [TensorFlow Documentation](https://www.tensorflow.org/)
- [ESP32 Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/)

---

<div align="center">

### 🌟 Star this repository if you find it helpful!

[![GitHub stars](https://img.shields.io/github/stars/abheethasma/Research-Project-Of-Mushroom?style=social)](https://github.com/abheethasma/Research-Project-Of-Mushroom/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/abheethasma/Research-Project-Of-Mushroom?style=social)](https://github.com/abheethasma/Research-Project-Of-Mushroom/network)
[![GitHub issues](https://img.shields.io/github/issues/abheethasma/Research-Project-Of-Mushroom?style=social)](https://github.com/abheethasma/Research-Project-Of-Mushroom/issues)

**Made with 💚 for the future of sustainable agriculture**

---

*Last Updated: November 2025*

[⬆️ Back to top](#-smart-mushroom-cultivation-analytics-framework)

</div>