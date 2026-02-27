import { Request, Response } from 'express';
import { extractSkills } from '../services/skillExtractor';
import { calculateSemanticSimilarity } from '../services/similarityEngine';
import { calculateGap } from '../services/skillGapEngine';
import { generateRecommendations } from '../services/recommendationEngine';
import { Mission } from '../models/Mission.model'; // Need this for Employability Index later

/**
 * Domain #74 Compliant Endpoint: 
 * Fully mathematical, deterministic AI Skill Gap Identification System.
 */
export const analyzeSkillGap = async (req: Request, res: Response) => {
    try {
        const { resumeText, jobDescriptionText } = req.body;

        if (!resumeText || !jobDescriptionText) {
            return res.status(400).json({ message: "Both resumeText and jobDescriptionText are required." });
        }

        // Domain #74: Call the dedicated Python ML Microservice
        const pythonResponse = await fetch('http://127.0.0.1:8000/api/ml/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                resumeText,
                jobDescriptionText,
                targetRole: req.body.targetRole || "Software Engineer"
            })
        });

        if (!pythonResponse.ok) {
            throw new Error(`Python ML Engine error: ${pythonResponse.statusText}`);
        }

        const mlData = await pythonResponse.json();

        // The ML Engine returns classification, confidenceScore, missingSkills, extractedSkills, and recommendations.
        // We still calculate Semantic Similarity and Employability Index here to bind it to the Mongo Database coding score.
        const semanticSimilarity = calculateSemanticSimilarity(resumeText, jobDescriptionText);

        // Derive match and weighted scores from ML data
        const matchCount = (mlData.extractedSkills || []).length;
        const missingCount = (mlData.missingSkills || []).length;
        const totalSkills = matchCount + missingCount || 1;
        const matchScoreRaw = Math.round((matchCount / totalSkills) * 100);

        // For backwards compatibility with the UI, we'll use matchScoreRaw as the weighted score 
        // until the UI is updated to use the new ML 'classification' label.
        const weightedScore = matchScoreRaw;

        // 5. Employability Index Math
        // Formula: (0.4 * weightedScore) + (0.3 * semanticSimilarity) + (0.3 * codingPerformanceScore)
        // Note: For now, if unauthenticated or new, codingPerformanceScore is 0. 
        // We will fetch real performance from the Mission model below if auth exists.

        let codingPerformanceScore = 0;
        const userId = (req as any).user?._id;

        if (userId) {
            // Find completed missions related to matched/job skills to boost score
            const missions = await Mission.find({ userId });

            // Simple heuristic for now: average score of all completed missions
            if (missions.length > 0) {
                const totalScore = missions.reduce((acc, m) => acc + (m.score || 0), 0);
                codingPerformanceScore = Math.min(100, (totalScore / missions.length));
            }
        }

        const employabilityIndex = Math.round(
            (weightedScore * 0.4) +
            (semanticSimilarity * 0.3) +
            (codingPerformanceScore * 0.3)
        );

        // 6. Return standard structured Hackathon output
        return res.status(200).json({
            matchScoreRaw,
            weightedScore,
            semanticSimilarity,
            employabilityIndex,
            matchedSkills: mlData.extractedSkills,
            missingSkills: mlData.missingSkills,
            recommendations: mlData.recommendations,
            // New ML Metadata
            classification: mlData.classification,
            confidenceScore: mlData.confidenceScore
        });

    } catch (error) {
        console.error("Hackathon Skill Gap Analysis Error:", error);
        return res.status(500).json({ message: "Internal mathematical engine error." });
    }
};
