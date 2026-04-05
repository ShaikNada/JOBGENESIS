import spacy
from db import skills_collection

# Load the small English NLP model.
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # Fallback if model isn't downloaded yet
    import os
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

def get_known_skills() -> set:
    """
    Fetches the valid tech skills dynamically from the MongoDB collection.
    """
    skills_cursor = skills_collection.find({}, {"name": 1})
    return {doc["name"].lower() for doc in skills_cursor if "name" in doc}

def extract_skills_spacy(text: str) -> list[str]:
    """
    Uses spaCy NLP to tokenize and extract technical skills from raw text,
    verifying them against our dynamic MongoDB database.
    """
    if not text:
        return []

    # Dynamically fetch known skills from DB
    known_skills = get_known_skills()

    doc = nlp(text.lower())
    extracted = set()

    # 1. Look for recognized tech entities (PROPN, NOUN)
    for token in doc:
        if token.text in known_skills:
            extracted.add(token.text)
            
    # 2. Extract multi-word skills (Noun Chunks) like "system design"
    for chunk in doc.noun_chunks:
        chunk_text = chunk.text.strip()
        if chunk_text in known_skills:
            extracted.add(chunk_text)

    # 3. Robust Pattern Fallback (Hackathon Safety Net)
    # Catches common patterns like "Node.js", "React-Native", etc.
    import re
    tech_patterns = [
        r'\b[a-z]+\.js\b', r'\b[a-z]+\.py\b', r'\b[a-z]+[#+]{1,2}', 
        r'\baws\b', r'\bazure\b', r'\bgcp\b', r'\bdocker\b', r'\bk8s\b'
    ]
    for pattern in tech_patterns:
        matches = re.findall(pattern, text.lower())
        for m in matches:
            extracted.add(m)

    return list(extracted)
