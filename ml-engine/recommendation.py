import pandas as pd

# Hardcoded dataset of learning resources for this demo.
# In production, this would be a real CSV or connected DB query.
RESOURCE_DATA = [
    {"skill": "react", "title": "React Official Docs", "url": "https://react.dev", "type": "course"},
    {"skill": "javascript", "title": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript", "type": "documentation"},
    {"skill": "python", "title": "Python Tutorial", "url": "https://docs.python.org/3/tutorial/", "type": "documentation"},
    {"skill": "docker", "title": "Docker 101", "url": "https://www.docker.com/101-tutorial/", "type": "course"},
    {"skill": "kubernetes", "title": "K8s Basics", "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/", "type": "documentation"},
    {"skill": "aws", "title": "AWS Skill Builder", "url": "https://explore.skillbuilder.aws/", "type": "certification"},
    {"skill": "sql", "title": "SQL Tutorial", "url": "https://www.w3schools.com/sql/", "type": "course"},
    {"skill": "machine learning", "title": "Google ML Crash Course", "url": "https://developers.google.com/machine-learning/crash-course", "type": "course"},
    {"skill": "system design", "title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer", "type": "project"},
    {"skill": "algorithms", "title": "LeetCode Explore", "url": "https://leetcode.com/explore/", "type": "project"}
]

# Load resources into a Pandas DataFrame
df_resources = pd.DataFrame(RESOURCE_DATA)

def get_recommendations(missing_skills: list[str], target_role: str) -> list[dict]:
    """
    Uses Pandas to filter and map missing skills to optimal learning resources.
    Returns the top 5 most relevant recommendations.
    """
    if not missing_skills:
        return []

    # Map the missing skills list to lowercase to match our dataframe
    missing_lower = [s.lower() for s in missing_skills]
    
    # Use Pandas to filter the datframe where 'skill' is IN 'missing_lower'
    matched_df = df_resources[df_resources['skill'].isin(missing_lower)]
    
    # Convert back to a list of dicts to return via JSON API
    recommendations = matched_df.to_dict(orient="records")
    
    # We could do advanced matrix filtering here (e.g., sorting by closest semantic role)
    # For now, just return up to 5 recommendations
    return recommendations[:5]
