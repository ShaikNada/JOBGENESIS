import { Request, Response } from 'express';
import { askAI } from '../services/ai/modelRouter';
import { randomUUID } from 'crypto';

import { cacheGet, cacheSet, cacheDelete } from '../db/redis';

export const generateAssessment = async (req: Request, res: Response) => {
    try {
        const { role, company, experienceLevel } = req.body;

        if (!role) {
            return res.status(400).json({ message: "Role is required to generate assessment." });
        }

        const prompt = `
        You are an expert technical interviewer at ${company || 'a top tech firm'}.
        Generate 3 challenging multiple-choice questions for a ${experienceLevel || 'mid-level'} ${role} candidate.
        
        The questions should be highly technical, covering architecture, specific language quirks, or system design trade-offs. 
        Do not make them easy.
        
        Provide exactly 4 options per question. 
        
        Return the response strictly as a JSON array in the following format:
        [
            {
                "id": 1,
                "question": "What is the primary technical advantage of...",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctIndex": 2, // integer 0-3
                "explanation": "Option C is correct because..."
            }
        ]
        `;

        const responseText = await askAI(prompt);

        let cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        let questions = JSON.parse(cleanJson);

        // Generate a unique assessment session ID
        const assessmentId = randomUUID();

        // Save the *Truth* to Redis/Memory (so the user cannot cheat by inspecting network traffic)
        // Store for exactly 1 hour (3600 seconds)
        await cacheSet(`assessment:${assessmentId}`, questions, 3600);

        // Strip the answers and explanations before sending to the client frontend
        const safeQuestions = questions.map((q: any) => ({
            id: q.id,
            question: q.question,
            options: q.options
        }));

        return res.status(200).json({
            assessmentId,
            questions: safeQuestions
        });

    } catch (error: any) {
        console.error("Error generating assessment:", error);
        return res.status(500).json({ message: "Failed to generate assessment." });
    }
};

export const submitAssessment = async (req: Request, res: Response) => {
    try {
        const { assessmentId, answers } = req.body; // answers: Record<string, number> where key=question id, value=selected option index

        if (!assessmentId || !answers) {
            return res.status(400).json({ message: "Missing required payload." });
        }

        const truthKey = await cacheGet<any[]>(`assessment:${assessmentId}`);
        if (!truthKey) {
            return res.status(404).json({ message: "Assessment session expired or invalid." });
        }

        let correctCount = 0;
        const results = truthKey.map((q: any) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correctIndex;
            if (isCorrect) correctCount++;

            return {
                questionId: q.id,
                isCorrect,
                correctIndex: q.correctIndex,
                explanation: q.explanation
            };
        });

        // Clean up from Redis
        await cacheDelete(`assessment:${assessmentId}`);

        const score = Math.round((correctCount / truthKey.length) * 100);

        return res.status(200).json({
            score,
            totalQuestions: truthKey.length,
            correctCount,
            detailedResults: results
        });

    } catch (error: any) {
        console.error("Error grading assessment:", error);
        return res.status(500).json({ message: "Failed to grade assessment." });
    }
}
