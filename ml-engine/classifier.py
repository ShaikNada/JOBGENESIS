import numpy as np
from sklearn.neighbors import KNeighborsClassifier

# Define a simple training dataset to classify Skill Gaps
# [matched_count, missing_count, total_required]
X_train = np.array([
    [10, 0, 10],   # Perfect Match
    [8, 2, 10],    # Minor Gap
    [5, 5, 10],    # Moderate Gap
    [2, 8, 10],    # High Gap
    [0, 10, 10],   # Critical Gap
    [6, 0, 6],     # Perfect Match (fewer skills)
    [3, 3, 6],     # Moderate Gap (fewer skills)
])

# Labels for the corresponding training data
y_train = [
    "Ready to Hire",
    "Minor Gap - Trainable",
    "Moderate Gap - Needs Upskilling",
    "High Gap - Significant Training Needed",
    "Critical Gap - Not a Fit",
    "Ready to Hire",
    "Moderate Gap - Needs Upskilling",
]

# Initialize and train the ML Classifier (K-Nearest Neighbors)
clf = KNeighborsClassifier(n_neighbors=1)
clf.fit(X_train, y_train)

def classify_skill_gap(match_count: int, missing_count: int, total_required: int) -> dict:
    """
    Uses a trained scikit-learn model to classify the candidate's skill gap.
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
        "label": prediction,
        "confidence": confidence
    }
