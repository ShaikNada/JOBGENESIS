import { Request, Response } from 'express';
import { askAI } from '../services/ai/modelRouter';
import { retrieveCompanyContext } from '../services/rag/knowledgeBase';

export const generateInitialQuestion = async (req: Request, res: Response) => {
    try {
        const { code, problemTitle, problemDescription, targetRole, company } = req.body;

        if (!code) {
            return res.status(400).json({ message: "Code payload is required for context." });
        }

        const ragContext = company ? retrieveCompanyContext(company) : "";

        const prompt = `
        You are an expert Senior Engineering Manager conducting a technical interview for a ${targetRole || 'Software Engineer'} role at ${company || 'your tech company'}.
        
        ${ragContext}

        The candidate just completed a coding challenge titled "${problemTitle || 'Algorithm Test'}".
        
        Here is the problem description:
        ${problemDescription || 'N/A'}
        
        Here is the code the candidate submitted:
        ${code}
        
        Your task is to review this code and ask ONE penetrating technical question. 
        Focus on either Time/Space Complexity, a specific design choice they made (like using a certain loop or data structure), or how this code would scale in a high-traffic production environment.
        Ensure your question strictly aligns with the engineering culture and constraints provided in the SYSTEM RAG INJECTION above.
        
        Do not answer the question or grade them. Just ask the question as if you are speaking directly to them on a video call. Keep it conversational but rigorous, matching the company culture.
        `;

        const responseText = await askAI(prompt);

        return res.status(200).json({ question: responseText });
    } catch (error: any) {
        console.error("Error generating interview question:", error);
        return res.status(500).json({ message: "Failed to generate AI question." });
    }
};

export const evaluateResponse = async (req: Request, res: Response) => {
    try {
        const { code, targetRole, question, transcript } = req.body;

        if (!transcript) {
            return res.status(400).json({ message: "Audio transcript is required." });
        }

        const prompt = `
        You are an expert Senior Engineering Manager interviewing a candidate for a ${targetRole || 'Software Engineer'} role.
        
        You previously asked the candidate this technical question regarding their code:
        "${question}"
        
        This is the candidate's transcribed spoken response:
        "${transcript}"
        
        Analyze their response. Did they correctly identify the complexity or architectural constraint? Were they confident and clear in their communication?
        
        Provide a JSON response strictly in this format:
        {
            "feedback": "A short, direct 2-3 sentence response directly to the candidate addressing their answer. E.g., 'Good catch on the O(n) time complexity, however...'",
            "communicationScore": <Number between 1-10>,
            "technicalAccuracyScore": <Number between 1-10>
        }
        `;

        const responseText = await askAI(prompt);

        // Ensure we parse the JSON out of the markdown blocks if Gemini added them
        let cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        let parsed;
        try {
            parsed = JSON.parse(cleanJson);
        } catch (e) {
            // Fallback parsing just in case the LLM formatting breaks
            parsed = {
                feedback: responseText,
                communicationScore: 7,
                technicalAccuracyScore: 7
            }
        }

        return res.status(200).json(parsed);

    } catch (error: any) {
        console.error("Error evaluating interview response:", error);
        return res.status(500).json({ message: "Failed to evaluate response." });
    }
}
