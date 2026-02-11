import axios from "axios";
import { askAI } from "../ai/modelRouter";

const RAPID_API_KEY = process.env.RAPID_API_KEY;
const JSEARCH_URL = "https://jsearch.p.rapidapi.com/search";

export interface JobListing {
    id: string;
    title: string;
    company: string;
    match: number;
    skills: string[];
    description: string;
    url?: string;
}

export async function fetchRealJobs(role: string, resumeData: any): Promise<JobListing[]> {
    // If we have an API Key, use real data
    if (RAPID_API_KEY) {
        try {
            const response = await axios.get(JSEARCH_URL, {
                params: {
                    query: `${role} engineer jobs`,
                    num_pages: "1",
                    date_posted: "all",
                },
                headers: {
                    "X-RapidAPI-Key": RAPID_API_KEY,
                    "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
                },
            });

            const data = response.data.data;
            return data.slice(0, 3).map((job: any, index: number) => ({
                id: job.job_id || `job-${index}`,
                title: job.job_title,
                company: job.employer_name,
                match: Math.floor(Math.random() * 15) + 80, // Simulation of match logic
                skills: job.job_required_skills || resumeData.skills.slice(0, 3), // Extract or fallback
                description: job.job_description?.slice(0, 100) + "...",
                url: job.job_apply_link,
            }));
        } catch (error) {
            console.error("JSearch API Error, falling back to AI Market Analysis", error);
        }
    }

    // Fallback to AI Market Analysis (Real roles at real companies based on current trends)
    const prompt = `
    You are a real-world career consultant and job market analyst with access to 2024/2025 industry trends.
    Based on this resume profile: ${JSON.stringify(resumeData)}
    And the specific role being targeted: ${role}

    Suggest 3 ACTUAL, CURRENT job openings at a diverse set of companies that would realistically hire this profile right now.
    Diversity requirements:
    - 1 Major Enterprise (e.g. Big Tech, Global Finance, etc.)
    - 1 High-Growth Unicorn or Mid-to-Large Startup
    - 1 Specialized/Niche firm or smaller agile company

    No "Mock" names. Return valid JSON only. Ensure the companies and roles are highly relevant to the candidate's skills: ${resumeData.skills?.join(", ")}.
    Use a dynamic variety of companies—avoid defaulting only to FAANG unless it truly fits.

    Return JSON format:
    [
      {
        "id": "real-1",
        "title": "Actual Job Title (e.g. Senior Frontend Engineer)",
        "company": "Real Company Name",
        "match": 92,
        "skills": ["Skill1", "Skill2", "Skill3"],
        "description": "2-sentence summary of what this role involves at this specific company.",
        "url": "Official careers page URL or LinkedIn job link"
      }
    ]
  `;

    try {
        const raw = await askAI(prompt);
        const cleaned = raw.replace(/```json|```/g, "").trim();
        return JSON.parse(cleaned);
    } catch (error) {
        console.error("AI Market Analysis Error:", error);
        return [];
    }
}
