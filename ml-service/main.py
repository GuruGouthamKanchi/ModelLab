from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
import pandas as pd
import numpy as np
import io
import joblib
import os
import uuid
from typing import List, Optional
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    mean_squared_error, mean_absolute_error, r2_score, confusion_matrix
)
from sklearn.preprocessing import LabelEncoder
from fastapi.responses import StreamingResponse

app = FastAPI()

def load_df(file_content: bytes, filename: str):
    try:
        if filename.endswith('.csv'):
            return pd.read_csv(io.BytesIO(file_content))
        elif filename.endswith('.json'):
            return pd.read_json(io.BytesIO(file_content))
        elif filename.endswith(('.xlsx', '.xls')):
            return pd.read_excel(io.BytesIO(file_content))
        else:
            return pd.read_csv(io.BytesIO(file_content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

@app.get("/")
async def root():
    return {"status": "online", "service": "ModelLab ML Engine", "version": "3.0.0"}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    try:
        content = await file.read()
        df = load_df(content, file.filename)
        
        missing_values = {col: int(val) for col, val in df.isnull().sum().to_dict().items()}
        dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}
        
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        numeric_stats = {}
        histograms = {}
        for col in numeric_cols:
            numeric_stats[col] = {
                "mean": float(df[col].mean()) if not pd.isna(df[col].mean()) else 0.0,
                "min": float(df[col].min()) if not pd.isna(df[col].min()) else 0.0,
                "max": float(df[col].max()) if not pd.isna(df[col].max()) else 0.0
            }
            data_clean = df[col].dropna()
            if not data_clean.empty:
                counts, bins = np.histogram(data_clean, bins=20)
                histograms[col] = {
                    "counts": counts.tolist(),
                    "bins": bins.tolist()
                }
            
        correlation = {}
        if len(numeric_cols) > 1:
            corr_df = df[numeric_cols].corr().fillna(0)
            correlation = {k: {ik: float(iv) for ik, iv in v.items()} for k, v in corr_df.to_dict().items()}
            
        cat_cols = df.select_dtypes(include=['object', 'category']).columns
        cat_stats = {}
        for col in cat_cols:
            value_counts = {str(k): int(v) for k, v in df[col].value_counts().head(10).to_dict().items()}
            cat_stats[col] = {
                "unique_count": int(df[col].nunique()),
                "top_values": value_counts
            }
            
        return {
            "total_rows": int(len(df)),
            "total_columns": int(len(df.columns)),
            "missing_values": missing_values,
            "dtypes": dtypes,
            "numeric_stats": numeric_stats,
            "histograms": histograms,
            "correlation": correlation,
            "categorical_stats": cat_stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/clean")
async def clean(
    file: UploadFile = File(...),
    drop_missing: bool = Form(False),
    fill_missing: Optional[str] = Form(None),
    drop_columns: Optional[str] = Form(None), # comma separated string
    encode_categorical: bool = Form(False)
):
    try:
        content = await file.read()
        df = load_df(content, file.filename)
        
        cols_to_drop = [c.strip() for c in drop_columns.split(',')] if drop_columns else []
        if cols_to_drop:
            df = df.drop(columns=[col for col in cols_to_drop if col in df.columns])
            
        if drop_missing:
            df = df.dropna()
        elif fill_missing:
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            for col in numeric_cols:
                if fill_missing == 'mean':
                    df[col] = df[col].fillna(df[col].mean())
                elif fill_missing == 'median':
                    df[col] = df[col].fillna(df[col].median())
            
            # Fill categoricals with mode
            for col in df.select_dtypes(include=['object', 'category']).columns:
                mode_val = df[col].mode()
                if not mode_val.empty:
                    df[col] = df[col].fillna(mode_val[0])
        
        if encode_categorical:
            for col in df.select_dtypes(include=['object', 'category']).columns:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))
        
        # Return cleaned as CSV stream
        stream = io.StringIO()
        df.to_csv(stream, index=False)
        return StreamingResponse(
            iter([stream.getvalue()]), 
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=cleaned_{file.filename}.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
async def train(
    file: UploadFile = File(...),
    algorithm: str = Form(...),
    target_column: str = Form(...),
    features: str = Form(...), # comma separated
    parameters: Optional[str] = Form("{}")
):
    try:
        content = await file.read()
        df = load_df(content, file.filename)
        
        feature_list = [f.strip() for f in features.split(',')]
        X = df[feature_list].copy()
        y = df[target_column].copy()
        
        # Auto-impute
        for col in X.select_dtypes(include=[np.number]).columns:
            X[col] = X[col].fillna(X[col].median())
        for col in X.select_dtypes(include=['object', 'category']).columns:
            X[col] = X[col].fillna('missing')
            
        # Encode features
        label_encoders = {}
        for col in X.select_dtypes(include=['object', 'category']).columns:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            label_encoders[col] = le
            
        # Determine task type
        is_classification = y.dtype == 'object' or y.dtype.name == 'category' or (request.algorithm in ['Logistic Regression', 'Decision Tree', 'Random Forest', 'K-Nearest Neighbors'] and y.nunique() < 20)
        
        if is_classification:
            le_y = LabelEncoder()
            y = le_y.fit_transform(y.astype(str))
            label_encoders[f'target_{target_column}'] = le_y
            task_type = 'classification'
        else:
            task_type = 'regression'
            
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Algorithm initialization
        if algorithm == 'Linear Regression': model = LinearRegression()
        elif algorithm == 'Logistic Regression': model = LogisticRegression(max_iter=1000)
        elif algorithm == 'Decision Tree': 
            model = DecisionTreeClassifier(random_state=42) if is_classification else DecisionTreeRegressor(random_state=42)
        elif algorithm == 'Random Forest':
            model = RandomForestClassifier(n_estimators=100, random_state=42) if is_classification else RandomForestRegressor(n_estimators=100, random_state=42)
        elif algorithm == 'K-Nearest Neighbors':
            model = KNeighborsClassifier() if is_classification else KNeighborsRegressor()
        else:
            raise HTTPException(status_code=400, detail="Unsupported algorithm")
            
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        # Metrics
        metrics = {}
        if is_classification:
            metrics['accuracy'] = float(accuracy_score(y_test, y_pred))
            metrics['precision'] = float(precision_score(y_test, y_pred, average='weighted', zero_division=0))
            metrics['recall'] = float(recall_score(y_test, y_pred, average='weighted', zero_division=0))
            metrics['f1'] = float(f1_score(y_test, y_pred, average='weighted', zero_division=0))
            metrics['confusion_matrix'] = confusion_matrix(y_test, y_pred).tolist()
        else:
            metrics['mse'] = float(mean_squared_error(y_test, y_pred))
            metrics['mae'] = float(mean_absolute_error(y_test, y_pred))
            metrics['r2'] = float(r2_score(y_test, y_pred))
            
        # Feature importance
        feature_importances = None
        if hasattr(model, 'feature_importances_'):
            feature_importances = {f: float(i) for f, i in zip(feature_list, model.feature_importances_)}
        elif hasattr(model, 'coef_'):
            coefs = np.abs(model.coef_)
            if coefs.ndim > 1: coefs = np.mean(coefs, axis=0)
            feature_importances = {f: float(i) for f, i in zip(feature_list, coefs)}

        # Visualization data (Sample 100)
        idx = np.random.choice(len(y_test), min(100, len(y_test)), replace=False)
        actual_vs_predicted = {
            "actual": np.array(y_test)[idx].tolist(),
            "predicted": np.array(y_pred)[idx].tolist()
        }
        
        # Save model to binary buffer
        model_buffer = io.BytesIO()
        joblib.dump({
            'model': model,
            'features': feature_list,
            'target_column': target_column,
            'label_encoders': label_encoders,
            'is_classification': is_classification,
            'task_type': task_type
        }, model_buffer)
        
        return {
            "metrics": metrics,
            "task_type": task_type,
            "feature_importances": feature_importances,
            "actual_vs_predicted": actual_vs_predicted,
            "class_labels": label_encoders[f'target_{target_column}'].classes_.tolist() if is_classification else [],
            "model_binary": model_buffer.getvalue().hex() # Send as hex string for simple JSON transport, or could use another stream
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict")
async def predict(
    model_file: UploadFile = File(...),
    inputs: str = Form(...) # JSON string
):
    try:
        import json
        input_data = json.loads(inputs)
        
        model_content = await model_file.read()
        saved_data = joblib.load(io.BytesIO(model_content))
        
        model = saved_data['model']
        features = saved_data['features']
        label_encoders = saved_data['label_encoders']
        is_classification = saved_data.get('is_classification', False)
        
        # Pre-process entry
        input_df = pd.DataFrame([input_data])
        for col, le in label_encoders.items():
            if col in input_df.columns:
                try:
                    input_df[col] = input_df[col].astype(str).map(lambda x: le.transform([x])[0] if x in le.classes_ else 0)
                except:
                    input_df[col] = 0
        
        prediction = model.predict(input_df[features])[0]
        
        # Decode target
        target_le_key = f"target_{saved_data['target_column']}"
        if target_le_key in label_encoders:
            prediction = label_encoders[target_le_key].inverse_transform([prediction])[0]
            
        confidence = 1.0
        if is_classification and hasattr(model, "predict_proba"):
            probs = model.predict_proba(input_df[features])
            confidence = float(np.max(probs))
            
        return {"prediction": str(prediction), "confidence": confidence}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
