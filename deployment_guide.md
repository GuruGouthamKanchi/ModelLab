# Deployment Guide: ModelLab on Vercel & Render

Follow these steps to move your application from your local workspace to a live production environment.

## 1. Prepare Your GitHub Repository

Ensure your project is structured as a mono-repo. Your GitHub repository should have the following folders at the root:
- `/client`
- `/server`
- `/ml-service`

### Git Push Commands:
In your terminal, run:
```bash
git add .
git commit -m "chore: prepare for production deployment with GridFS and binary streams"
git push origin main
```

---

## 2. Deploy Frontend on Vercel

1. **Import Project**: Go to [Vercel](https://vercel.com/new) and import your GitHub repository.
2. **Framework Preset**: Vercel should auto-detect **Vite**.
3. **Root Directory**: Select **`client`**.
4. **Environment Variables**: Add the following:
   - `VITE_API_URL`: `https://YOUR-BACKEND-URL.onrender.com/api`
     *(Note: You will get this URL in the next step from Render)*.
5. **Deploy**: Click "Deploy".

---

## 3. Deploy Backend (Node.js) on Render

1. **New Web Service**: In [Render Dashboard](https://dashboard.render.com), click **New+** -> **Web Service**.
2. **Repository**: Connect your GitHub repo.
3. **Name**: `modellab-backend`
4. **Root Directory**: `server`
5. **Runtime**: `Node`
6. **Build Command**: `npm install`
7. **Start Command**: `node index.js`
8. **Environment Variables**: Add the following:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `ML_SERVICE_URL`: `https://YOUR-ML-SERVICE.onrender.com`
   - `FRONTEND_URL`: `https://YOUR-FRONTEND.vercel.app`
   - `PORT`: `5000`
9. **Deploy**: Click "Create Web Service".

---

## 4. Deploy ML Service (Python) on Render

1. **New Web Service**: Click **New+** -> **Web Service**.
2. **Repository**: Connect your GitHub repo.
3. **Name**: `modellab-ml-service`
4. **Root Directory**: `ml-service`
5. **Runtime**: `Python`
6. **Build Command**: `pip install -r requirements.txt`
7. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 8000`
8. **Environment Variables**:
   - `PORT`: `8000`
9. **Deploy**: Click "Create Web Service".

---

## 5. Final Connectivity Loop (CRITICAL)

Once all services are deployed, you MUST update the circular dependencies:

1. **Backend -> ML**: Ensure `ML_SERVICE_URL` in the Backend (Render) points to the ML service's Render URL.
2. **Backend -> Frontend**: Ensure `FRONTEND_URL` in the Backend (Render) points to your Vercel URL (for CORS).
3. **Frontend -> Backend**: Update `VITE_API_URL` in Vercel to point to your Backend's Render URL.
4. **Redeploy**: Trigger a re-deployment on Vercel if you changed `VITE_API_URL`.

---

## 6. Verification Flow
1. Open your Vercel URL.
2. Login.
3. Upload a dataset (Verifies **GridFS**).
4. Train a model (Verifies **Binary Stream to ML Service**).
5. Run a prediction (Verifies **GridFS Model Fetch -> ML Inference**).

Congratulations! Your ModelLab instance is now globally accessible.
