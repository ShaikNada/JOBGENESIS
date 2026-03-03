import pandas as pd
import numpy as np
from sklearn.neighbors import KNeighborsClassifier
import os

# 1. Dynamically load the historical training data from the structural CSV file
csv_path = os.path.join(os.path.dirname(__file__), "historical_gaps.csv")
df = pd.read_csv(csv_path)

# 2. Prepare the feature matrix (X) and target labels (y) using Pandas
X_train = df[["match_count", "missing_count", "total_required"]].values
y_train = df["label"].values

# 3. Initialize and train the ML Classifier dynamically
clf = KNeighborsClassifier(n_neighbors=3)
clf.fit(X_train, y_train)

def classify_skill_gap(match_count: int, missing_count: int, total_required: int) -> dict:
    """
    Uses the trained scikit-learn model to classify the candidate's skill gap severity.
    """
    if total_required == 0:
        return {"label": "Insufficient Data", "confidence": 0.0}

    # Predict the class based on input features
    features = np.array([[match_count, missing_count, total_required]])
    prediction = clf.predict(features)[0]
    
    # Calculate a simple confidence score based on the ratio
    ratio = match_count / total_required if total_required > 0 else 0
    confidence = round(ratio * 100, 2)
    
    return {
        "label": str(prediction),
        "confidence": float(confidence)
    }

def sync_and_retrain(new_data: list):
    """
    Retrains the model with fresh data from the CAL pipeline.
    """
    global clf
    if not new_data:
        return
    
    # Convert new data to feature matrix
    new_df = pd.DataFrame(new_data)
    X_new = new_df[["match_count", "missing_count", "total_required"]].values
    y_new = new_df["label"].values
    
    # Combine with original training data
    X_combined = np.vstack((X_train, X_new))
    y_combined = np.concatenate((y_train, y_new))
    
    # Retrain
    clf = KNeighborsClassifier(n_neighbors=3)
    clf.fit(X_combined, y_combined)
    print(f"[ML ENGINE] Model retrained with {len(new_data)} new samples.")
