from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

# Import our ML/NLP modules (to be created next)
from nlp_processor import extract_skills_spacy
from classifier import classify_skill_gap
from recommendation import get_recommendations

app = FastAPI(title="Domain #74 ML Engine")

class AnalyzeRequest(BaseModel):
    resumeText: str
    jobDescriptionText: str
    targetRole: str
    
class AnalyzeResponse(BaseModel):
    extractedSkills: List[str]
    missingSkills: List[str]
    classification: str
    confidenceScore: float
    recommendations: List[dict]

@app.get("/health")
def health_check():
    return {"status": "ML Engine Online"}

@app.post("/api/ml/analyze", response_model=AnalyzeResponse)
def analyze_skills(req: AnalyzeRequest):
    try:
        # 1. NLP Extraction (spaCy)
        resume_skills = extract_skills_spacy(req.resumeText)
        job_skills = extract_skills_spacy(req.jobDescriptionText)
        
        # Calculate mathematical gap
        missing_skills = list(set(job_skills) - set(resume_skills))
        
        # 2. ML Classification (scikit-learn)
        classification_result = classify_skill_gap(
            match_count=len(set(resume_skills) & set(job_skills)),
            missing_count=len(missing_skills),
            total_required=len(job_skills)
        )
        
        # 3. Recommendation Engine (pandas)
        recs = get_recommendations(missing_skills, req.targetRole)
        
        return AnalyzeResponse(
            extractedSkills=resume_skills,
            missingSkills=missing_skills,
            classification=classification_result["label"],
            confidenceScore=classification_result["confidence"],
            recommendations=recs
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.1", port=8000)
