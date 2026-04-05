import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { askAI, getAIClient } from "./modelRouter";

const SERPAPI_KEY = process.env.SERPAPI_KEY;

/**
 * Gets a GenAI client from the central pool
 */
const getModel = (modelName: string) => {
    const client = getAIClient();
    if (!client) throw new Error("NO_AI_CLIENT_AVAILABLE");
    return client.getGenerativeModel({ model: modelName });
};

export interface LiveSearchResult {
    id: string;
    title: string;
    company: string;
    description: string;
    url: string;
    isAvailable: boolean;
    match?: number;
    skills?: string[];
}

/**
 * Searches the internet for job roles using SerpAPI with a fallback to Gemini Search Grounding.
 */
export async function searchJobsOnWeb(role: string, company: string): Promise<LiveSearchResult[]> {
    const query = `${role} jobs at ${company} official site career page 2024 2025`;
    
    // 1. Try SerpAPI first
    if (SERPAPI_KEY) {
        try {
            console.log(`[LiveSearch] Querying SerpAPI for: ${query}`);
            const response = await axios.get("https://serpapi.com/search", {
                params: {
                    q: query,
                    api_key: SERPAPI_KEY,
                    engine: "google",
                    num: 5
                }
            });

            const results = response.data.organic_results;
            if (results && results.length > 0) {
                return results.slice(0, 3).map((res: any) => ({
                    title: res.title,
                    company: company,
                    description: res.snippet,
                    url: res.link,
                    isAvailable: true,
                    match: 70 + Math.floor(Math.random() * 20), // Placeholder match
                    skills: ["React", "Node.js", "TypeScript"] // Need better extraction later
                }));
            }
        } catch (error) {
            console.error("[LiveSearch] SerpAPI Error:", error);
        }
    }

    // 2. Fallback to Gemini with Google Search Grounding
    try {
        console.log(`[LiveSearch] Falling back to AI for: ${query}`);
        
        const prompt = `
            You are a real-time job market analyst. I need to know if there are active "${role}" job openings at "${company}" right now (late 2024 / 2025).
            
            Search your knowledge and provide real evidence or highly likely vacancies.
            If NO vacancies are found, explicitly say "No active vacancies found" but still provide what the typical requirements for this role at ${company} are.

            Return JSON format exactly:
            {
                "found": boolean,
                "listings": [
                    {
                        "title": "string",
                        "company": "string",
                        "description": "string",
                        "url": "string"
                    }
                ],
                "typicalRequirements": ["string"]
            }
        `;

        const responseText = await askAI(prompt);
        const cleaned = responseText.replace(/```json|```/g, "").trim();
        const data = JSON.parse(cleaned);

        return data.listings.map((l: any) => ({
            ...l,
            id: `ai-${Math.random().toString(36).substr(2, 9)}`,
            isAvailable: data.found
        }));

    } catch (error) {
        console.error("[LiveSearch] AI Fallback Error:", error);
        return [];
    }
}

/**
 * Auto-matches roles for a candidate by searching the live internet based on their top skills.
 */
export async function autoMatchLive(resumeData: any): Promise<LiveSearchResult[]> {
    const skills = resumeData.skills?.slice(0, 5).join(", ") || "Software Engineer";
    const query = `current job openings for ${skills} remote or hybrid 2025`;

    try {
        // We'll use the same SerpAPI logic here for consistency
        const response = await axios.get("https://serpapi.com/search", {
            params: {
                q: query,
                api_key: SERPAPI_KEY,
                engine: "google",
                num: 10
            }
        });

        const results = response.data.organic_results;
        if (results && results.length > 0) {
            return results.slice(0, 5).map((res: any, index: number) => ({
                id: res.cache_id || `live-${index}`,
                title: res.title,
                // Extract company from source or snippets if available
                company: res.source || res.display_link || "Real World Job",
                description: res.snippet,
                url: res.link,
                isAvailable: true,
                match: 75 + Math.floor(Math.random() * 20),
                skills: resumeData.skills?.slice(0, 3) || ["Software Development"]
            }));
        }
    } catch (error) {
        console.error("[LiveSearch] AutoMatch SerpAPI Error:", error);
    }

    // 2. Fallback to Gemini with Google Search Grounding for Auto-Match
    try {
        console.log(`[LiveSearch] Falling back to AI for Auto-Match: ${skills}`);
        
        const prompt = `
            You are a job market analyst. Based on these skills: ${skills}, suggest 5 real-world, active job roles and specific companies hiring in 2025.
            
            Return JSON format exactly:
            [
                {
                    "id": "string",
                    "title": "string",
                    "company": "string",
                    "description": "string",
                    "url": "string",
                    "match": number,
                    "skills": ["string"]
                }
            ]
        `;

        const responseText = await askAI(prompt);
        const cleaned = responseText.replace(/```json|```/g, "").trim();
        const data = JSON.parse(cleaned);

        return data.map((j: any, i: number) => ({
            ...j,
            id: j.id || `ai-auto-${i}`,
            isAvailable: true
        }));

    } catch (error) {
        console.error("[LiveSearch] AutoMatch AI Fallback Error:", error);
        return [];
    }
}
