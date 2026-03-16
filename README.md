# ModelLab - Interactive ML Model Builder

ModelLab is a powerful, visual automated machine learning (AutoML) platform that allows users to build, train, and deploy machine learning models without writing a single line of code.

## Key Features
- **Visual Dataset Explorer**: Interactive charts and statistics for CSV/Excel data.
- **No-Code Model Builder**: Configure training pipelines with simple UI controls.
- **Multiple Algorithms**: Support for Random Forest, KNN, Decision Trees, and Regressions.
- **Experiment Tracking**: Full history of training runs and performance metrics.
- **Live Inference**: Test your models instantly with a dedicated prediction interface.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Chart.js, Framer Motion.
- **Backend**: Node.js, Express, MongoDB.
- **ML Engine**: Python, FastAPI, Scikit-learn, Pandas.

## Setup Instructions

### 1. Prerequisite
- Node.js (v16+)
- Python (3.9+)
- MongoDB (running locally or a connection string)

### 2. Backend (Node.js)
```bash
cd server
npm install
# Ensure .env is configured (defaults are provided)
npm start
```

### 3. ML Service (Python)
```bash
cd ml-service
pip install -r requirements.txt
python main.py
```

### 4. Frontend (React)
```bash
cd client
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.
The API runs at `http://localhost:5000`.
The ML Service runs at `http://localhost:8000`.

## Architecture
ModelLab follows a microservices-inspired architecture:
- **Frontend** handles user interaction and visualizations.
- **Backend API** manages authentication, metadata, and service orchestration.
- **ML Service** performs compute-intensive model training and inference using Scikit-learn.
