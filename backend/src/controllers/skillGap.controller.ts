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

        // 1. Deterministic Extraction (NLP / Keyword Match vs DB)
        const userSkills = await extractSkills(resumeText);
        const jobSkills = await extractSkills(jobDescriptionText);

        // 2. Skill Gap Math Engine
        const gapResult = calculateGap(userSkills, jobSkills);

        // 3. TF-IDF Semantic Similarity Engine
        const semanticSimilarity = calculateSemanticSimilarity(resumeText, jobDescriptionText);

        // 4. Recommendation Engine
        const recommendations = generateRecommendations(gapResult.missingSkills);

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
            (gapResult.weightedScore * 0.4) +
            (semanticSimilarity * 0.3) +
            (codingPerformanceScore * 0.3)
        );

        // 6. Return standard structured Hackathon output
        return res.status(200).json({
            matchScoreRaw: gapResult.matchScoreRaw,
            weightedScore: gapResult.weightedScore,
            semanticSimilarity,
            employabilityIndex,
            matchedSkills: gapResult.matchedSkills.map(s => s.name),
            missingSkills: gapResult.missingSkills.map(s => s.name),
            recommendations
        });

    } catch (error) {
        console.error("Hackathon Skill Gap Analysis Error:", error);
        return res.status(500).json({ message: "Internal mathematical engine error." });
    }
};
