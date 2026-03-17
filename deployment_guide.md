# JobGenesis Deployment Guide 🚀

This guide provides step-by-step instructions for deploying the JobGenesis ecosystem (Frontend, Backend, and ML-Engine).

---

## 🏗️ Local Deployment (Docker)

The fastest way to run the entire stack locally is using Docker Compose.

1.  **Environment Setup**:
    Create a `.env` file in the root directory with the following:
    ```env
    GEMINI_API_KEY=your_gemini_key
    JWT_SECRET=your_jwt_secret
    MONGO_URI=mongodb://mongo:27017/jobgenesis
    ```

2.  **Launch**:
    ```bash
    docker-compose up --build
    ```
    - **Frontend**: http://localhost:80
    - **Backend**: http://localhost:4000
    - **ML-Engine**: http://localhost:8000

---

## 🌐 Production Deployment

### 1. Frontend (Vercel)
Ideal for the React + Vite frontend.
- **Root Directory**: `./` (Project root)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Environment Variables**:
  - `VITE_BACKEND_URL`: URL of your deployed backend.

### 2. Backend & ML-Engine (Railway / Render)
These platforms handle Node.js and Python microservices with ease.

#### Backend (Node.js)
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Ports**: 4000
- **Required Env**: `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`.

#### ML-Engine (Python)
- **Root Directory**: `ml-engine`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Ports**: 8000

---

## 📊 Database & Cache
- **MongoDB**: Use **MongoDB Atlas** for a managed production database.
- **Redis**: Use **Upstash** or **Redis Cloud** for a serverless cache.

---

## 📡 CI/CD Pipeline
Every push to the `master` or `main` branch triggers the **JobGenesis CI** via GitHub Actions, which validates:
- Frontend build sanity.
- Backend TypeScript compilation.
- ML-Engine dependency integrity.
