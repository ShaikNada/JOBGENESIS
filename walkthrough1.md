# ✅ Domain #74 Implementation Walkthrough

## What Was Built

### 1. Python ML Microservice (Hackathon Stack Compliance) 🐍
To strictly satisfy the hackathon requirement of **"Python, NLP, ML Classification, Recommendation Engine"**, a standalone Python microservice was built to handle the heavy mathematical lifting.

| File | Purpose |
|---|---|
| [ml-engine/main.py](file:///d:/project/jobGenisis%281%29/coding-gauntlet/ml-engine/main.py) | FastAPI Server exposing `/api/ml/analyze` |
| [ml-engine/nlp_processor.py](file:///d:/project/jobGenisis%281%29/coding-gauntlet/ml-engine/nlp_processor.py) | Uses `spaCy` NLP for Named Entity Recognition (NER) to extract skills. |
| [ml-engine/classifier.py](file:///d:/project/jobGenisis%281%29/coding-gauntlet/ml-engine/classifier.py) | Uses `scikit-learn` K-Nearest Neighbors to classify the exact "Severity" of the skill gap based on a training dataset. |
| [ml-engine/recommendation.py](file:///d:/project/jobGenisis%281%29/coding-gauntlet/ml-engine/recommendation.py) | Uses `pandas` and dataframe filtering to act as the mathematical Recommendation Engine. |
| [ml-engine/requirements.txt](file:///d:/project/jobGenisis%281%29/coding-gauntlet/ml-engine/requirements.txt) | Python dependencies. |

### 2. Node.js Backend Integration ⚙️
The existing Node API was updated to act as an orchestration layer.
- [backend/src/controllers/skillGap.controller.ts](file:///d:/project/jobGenisis%281%29/coding-gauntlet/backend/src/controllers/skillGap.controller.ts) now proxies the resume text to the Python server.
- The Python server calculates the **NLP Similarity, Missing Skills, and Recommendations**.
- The Node server calculates the **Coding Performance Score** (based on Mongoose [Mission](file:///d:/project/jobGenisis%281%29/coding-gauntlet/src/components/MissionSelect.tsx#44-269) DB data).
- The Node server combines them into the final **Employability Index**.

---

## 🚀 How to Run & Verify

You now need to run **three** terminals:
1. Frontend (Vite)
2. Backend (Node.js)
3. ML Engine (Python)

### Step 1: Start the Python ML Engine
Open a new terminal, navigate to the `ml-engine` folder, and run:
```bash
cd ml-engine
# Optional: Create a virtual environment
# python -m venv venv
# source venv/bin/activate (or venv\Scripts\activate on Windows)

# Install the ML libraries
pip install -r requirements.txt

# Download the NLP English model for spaCy
python -m spacy download en_core_web_sm

# Start the ML Server
uvicorn main:app --reload
```
*The Python ML Engine will start on `http://127.0.0.1:8000`*

### Step 2: Seed the Skills Database (one-time)
If you haven't already, visit this URL while the Node backend is running (port 4000):
```
GET http://localhost:4000/api/skill-gap/seed
```

### Step 3: Test the UI
1. Login → Go to **Job Dashboard** → Click **Target Role** tab.
2. Select a Role, Company, and Level.
3. Hit **Scan Target & Analyze**.
4. The Node backend will instantly call the Python ML backend. 
5. The UI will render the complete Domain #74 Metrics panel, perfectly merging your Node.js code execution scores with the Python ML NLP classifications!
