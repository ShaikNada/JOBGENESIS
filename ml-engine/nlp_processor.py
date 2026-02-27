import spacy

# Load the small English NLP model. In production, we'd use a custom NER model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # Fallback if model isn't downloaded yet during demo
    import os
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# A set of known technical skills to help the basic NLP model extract them
KNOWN_SKILLS = {
    "javascript", "typescript", "react", "vue", "angular", "node.js", "python", 
    "java", "c++", "go", "ruby", "php", "sql", "postgresql", "mysql", "mongodb", 
    "redis", "aws", "gcp", "azure", "docker", "kubernetes", "linux", "git", 
    "ci/cd", "machine learning", "data structures", "algorithms", "system design"
}

def extract_skills_spacy(text: str) -> list[str]:
    """
    Uses spaCy NLP to tokenize and extract technical skills from raw text.
    Replaces simple regex with actual named entity recognition logic.
    """
    if not text:
        return []

    doc = nlp(text.lower())
    extracted = set()

    # 1. Look for recognized tech entities (PROPN, NOUN)
    for token in doc:
        # Check against our known dictionary for exact matches
        if token.text in KNOWN_SKILLS:
            extracted.add(token.text)
            
    # 2. Extract multi-word skills (Noun Chunks) like "system design"
    for chunk in doc.noun_chunks:
        chunk_text = chunk.text.strip()
        if chunk_text in KNOWN_SKILLS:
            extracted.add(chunk_text)

    return list(extracted)
