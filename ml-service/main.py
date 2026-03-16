from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, mean_squared_error, r2_score, confusion_matrix
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib
import os
import uuid

app = FastAPI()

def load_dataset(dataset_path: str):
    if not os.path.exists(dataset_path):
        raise HTTPException(status_code=404, detail=f"Dataset file not found: {dataset_path}")
    
    if dataset_path.endswith('.csv'):
        try:
            return pd.read_csv(dataset_path)
        except UnicodeDecodeError:
            try:
                return pd.read_csv(dataset_path, encoding='latin1')
            except:
                return pd.read_csv(dataset_path, encoding='ISO-8859-1')
    elif dataset_path.endswith('.json'):
        return pd.read_json(dataset_path)
    elif dataset_path.endswith(('.xlsx', '.xls')):
        return pd.read_excel(dataset_path)
    else:
        # Fallback to CSV if extension is unknown but might be text
        try:
            return pd.read_csv(dataset_path)
        except:
            raise HTTPException(status_code=400, detail="Unsupported file format")


@app.get("/")
async def root():
    return {"status": "online", "service": "ModelLab ML Engine", "version": "1.0.0"}

class TrainRequest(BaseModel):
    dataset_path: str
    algorithm: str
    target_column: str
    features: list
    parameters: dict = {}

class PredictRequest(BaseModel):
    model_path: str
    inputs: dict

class AnalyzeRequest(BaseModel):
    dataset_path: str

class CleanRequest(BaseModel):
    dataset_path: str
    drop_missing: bool = False
    fill_missing: str = None # 'mean', 'median', 'mode'
    drop_columns: list = []
    encode_categorical: bool = False

@app.post("/train")
async def train(request: TrainRequest):
    try:
        # Load dataset
        df = load_dataset(request.dataset_path)
        
        X = df[request.features]
        y = df[request.target_column]
        
        # Simple preprocessing
        # Handle missing values
        X = X.fillna(X.median(numeric_only=True))
        X = X.fillna('missing')
        
        # Encode categorical features
        label_encoders = {}
        for col in X.select_dtypes(include=['object']).columns:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            label_encoders[col] = le
            
        if y.dtype == 'object':
            le_y = LabelEncoder()
            y = le_y.fit_transform(y.astype(str))
            label_encoders[f'target_{request.target_column}'] = le_y
            is_classification = True
        else:
            is_classification = request.algorithm in ['Logistic Regression', 'Decision Tree', 'Random Forest', 'K-Nearest Neighbors'] and y.nunique() < 20
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Algorithm selection
        model = None
        if request.algorithm == 'Linear Regression':
            model = LinearRegression()
        elif request.algorithm == 'Logistic Regression':
            model = LogisticRegression()
        elif request.algorithm == 'Decision Tree':
            model = DecisionTreeClassifier() if is_classification else DecisionTreeRegressor()
        elif request.algorithm == 'Random Forest':
            model = RandomForestClassifier() if is_classification else RandomForestRegressor()
        elif request.algorithm == 'K-Nearest Neighbors':
            model = KNeighborsClassifier() if is_classification else KNeighborsRegressor()
        else:
            raise HTTPException(status_code=400, detail="Unsupported algorithm")
            
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        metrics = {}
        if is_classification:
            metrics['accuracy'] = accuracy_score(y_test, y_pred)
            metrics['precision'] = precision_score(y_test, y_pred, average='weighted', zero_division=0)
            metrics['recall'] = recall_score(y_test, y_pred, average='weighted', zero_division=0)
            metrics['f1'] = f1_score(y_test, y_pred, average='weighted', zero_division=0)
            cm = confusion_matrix(y_test, y_pred)
            metrics['confusion_matrix'] = cm.tolist()
        else:
            metrics['mse'] = mean_squared_error(y_test, y_pred)
            metrics['r2'] = r2_score(y_test, y_pred)
            
        # Save model
        model_id = str(uuid.uuid4())
        model_dir = "saved_models"
        if not os.path.exists(model_dir):
            os.makedirs(model_dir)
            
        model_path = os.path.join(model_dir, f"{model_id}.joblib")
        joblib.dump({
            'model': model,
            'features': request.features,
            'target_column': request.target_column,
            'label_encoders': label_encoders,
            'is_classification': is_classification,
            'feature_types': X.dtypes.to_dict()
        }, model_path)
        
        return {
            "metrics": metrics,
            "model_path": model_path
        }
    except Exception as e:
        print(f"Training error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze")
async def analyze_dataset(request: AnalyzeRequest):
    try:
        df = load_dataset(request.dataset_path)
        
        # 1. Missing Values Overview - Ensure native types
        missing_values = {col: int(val) for col, val in df.isnull().sum().to_dict().items()}
        
        # 2. Data Types
        dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}
        
        # 3. Numeric Summaries & Histograms
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        numeric_stats = {}
        histograms = {}
        for col in numeric_cols:
            numeric_stats[col] = {
                "mean": float(df[col].mean()) if not pd.isna(df[col].mean()) else 0.0,
                "min": float(df[col].min()) if not pd.isna(df[col].min()) else 0.0,
                "max": float(df[col].max()) if not pd.isna(df[col].max()) else 0.0
            }
            # Calculate histogram bins (e.g., 20 bins)
            data_clean = df[col].dropna()
            if not data_clean.empty:
                counts, bins = np.histogram(data_clean, bins=20)
                histograms[col] = {
                    "counts": counts.tolist(),
                    "bins": bins.tolist()
                }
            else:
                histograms[col] = {"counts": [], "bins": []}
            
        # 4. Correlation Matrix - Ensure native floats
        correlation = {}
        if len(numeric_cols) > 1:
            corr_df = df[numeric_cols].corr().fillna(0)
            correlation = {k: {ik: float(iv) for ik, iv in v.items()} for k, v in corr_df.to_dict().items()}
            
        # 5. Categorical Summaries
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
        print(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/clean")
async def clean_dataset(request: CleanRequest):
    try:
        df = load_dataset(request.dataset_path)
        
        # 1. Drop columns
        if request.drop_columns:
            df = df.drop(columns=[col for col in request.drop_columns if col in df.columns])
            
        # 2. Handle missing values
        if request.drop_missing:
            df = df.dropna()
        elif request.fill_missing:
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            cat_cols = df.select_dtypes(include=['object', 'category']).columns
            
            if request.fill_missing == 'mean':
                df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())
            elif request.fill_missing == 'median':
                df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
                
            # Mode for categorical or if mode is chosen for numerical
            if request.fill_missing == 'mode' or len(cat_cols) > 0:
                for col in df.columns:
                    mode_val = df[col].mode()
                    if not mode_val.empty:
                        df[col] = df[col].fillna(mode_val[0])
                        
        # Final fallback for any remaining NaNs (e.g., column was entirely NaN)
        df = df.fillna(0)

        # 3. Categorical encoding
        if request.encode_categorical:
            cat_cols = df.select_dtypes(include=['object', 'category']).columns
            for col in cat_cols:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))

        # 4. Save cleaned dataset
        dir_name = os.path.dirname(request.dataset_path)
        base_name = os.path.basename(request.dataset_path)
        name, ext = os.path.splitext(base_name)
        new_filename = f"{name}_cleaned_{uuid.uuid4().hex[:6]}.csv"
        new_path = os.path.join(dir_name, new_filename)
        
        df.to_csv(new_path, index=False)
        
        return {
            "status": "success",
            "message": "Dataset cleaned successfully",
            "cleaned_dataset_path": new_path,
            "new_row_count": len(df),
            "new_col_count": len(df.columns)
        }

    except Exception as e:
        print(f"Cleaning error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict")
async def predict(request: PredictRequest):
    try:
        if not os.path.exists(request.model_path):
            raise HTTPException(status_code=404, detail="Model file not found")
            
        saved_data = joblib.load(request.model_path)
        model = saved_data['model']
        features = saved_data['features']
        target_column = saved_data['target_column']
        label_encoders = saved_data['label_encoders']
        is_classification = saved_data['is_classification']
        feature_types = saved_data.get('feature_types', {})
        
        # Prepare input data
        input_data = {}
        for f in features:
            val = request.inputs.get(f)
            # Try to convert to the original numeric type if applicable
            if f in feature_types:
                if np.issubdtype(feature_types[f], np.number):
                    try:
                        val = float(val) if val != '' else 0.0
                    except:
                        val = 0.0
            input_data[f] = val

        input_df = pd.DataFrame([input_data])
        
        # Encode inputs
        for col, le in label_encoders.items():
            if col in input_df.columns:
                try:
                    # Handle unseen categories by mapping to a default (usually 0 after fit)
                    # A more robust way would be handling it during fit_transform
                    input_df[col] = input_df[col].astype(str).map(lambda x: le.transform([x])[0] if x in le.classes_ else 0)
                except Exception as e:
                    print(f"Encoding error for {col}: {e}")
                    input_df[col] = 0
                    
        prediction = model.predict(input_df[features])
        
        # Inverse transform target if encoded
        res_prediction = prediction[0]
        target_le_key = f"target_{target_column}"
        if target_le_key in label_encoders:
            res_prediction = label_encoders[target_le_key].inverse_transform([res_prediction])[0]
        
        # Confidence score
        confidence = 1.0
        if is_classification and hasattr(model, "predict_proba"):
            probs = model.predict_proba(input_df[features])
            confidence = float(np.max(probs))
            
        return {
            "prediction": str(res_prediction),
            "confidence": confidence
        }
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
