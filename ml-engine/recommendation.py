import pandas as pd
from db import skills_collection

def get_recommendations(missing_skills: list[str], target_role: str) -> list[dict]:
    """
    Uses Pandas to filter and map missing skills to optimal learning resources.
    Data is fetched dynamically from the MongoDB collection.
    """
    if not missing_skills:
        return []

    missing_lower = [s.lower() for s in missing_skills]
    
    # 1. Query MongoDB to get details of the missing skills
    skills_cursor = skills_collection.find({"name": {"$in": missing_lower}})
    
    # 2. Prepare data for Pandas dataframe processing
    resource_data = []
    for skill_doc in skills_cursor:
        skill_name = skill_doc.get("name")
        resources = skill_doc.get("learningResources", [])
        
        resource_data.append({
            "skillName": skill_name,
            "resources": resources,
            "demandScore": skill_doc.get("demandScore", 5)
        })
            
    if not resource_data:
        return []
        
    df_resources = pd.DataFrame(resource_data)
    
    # 3. Use Pandas to sort by the mathematically highest Demand Score
    df_sorted = df_resources.sort_values(by="demandScore", ascending=False)
    
    # Drop the demand score prior to sending over the wire
    df_final = df_sorted.drop(columns=["demandScore"])
    
    # 4. Convert to standard dict structure for JSON API return
    recommendations = df_final.to_dict(orient="records")
    
    return recommendations[:5]
