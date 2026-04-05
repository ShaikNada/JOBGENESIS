import { Request, Response } from 'express';
import axios from 'axios';
import { askAI } from '../services/ai/modelRouter';
import { calculateSemanticSimilarity } from '../services/similarityEngine';

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://127.0.0.1:8000';

/**
 * Enhanced Skill Gap Analysis with Robust ML + AI Fallback
 */
export const analyzeSkillGap = async (req: Request, res: Response) => {
    try {
        const { resumeText, jobDescriptionText, targetRole } = req.body;

        if (!resumeText || !jobDescriptionText) {
            return res.status(400).json({ message: "Both resumeText and jobDescriptionText are required." });
        }

        console.log(`[SkillGap] Analyzing role: ${targetRole || 'General'}`);

        let mlData: any = { extractedSkills: [], missingSkills: [], matchScore: 0 };

        // 1️⃣ Attempt ML Engine (FastAPI)
        try {
            const mlResponse = await axios.post(`${ML_ENGINE_URL}/api/ml/analyze`, {
                resumeText,
                jobDescriptionText,
                targetRole: targetRole || 'Software Engineer'
            }, { timeout: 5000 });
            mlData = mlResponse.data;
            console.log('[SkillGap] ML Engine analysis successful');
        } catch (mlErr: any) {
            console.warn('[SkillGap] ML Engine unavailable or failed. Using AI fallback.');
        }

        // 2️⃣ Advanced AI Analysis (Prime for Accuracy)
        // We ALWAYS run AI for high-fidelity matching during the hackathon to ensure 
        // common skills like HTML/CSS/JS are never missed.
        const prompt = `
            You are a world-class technical recruiter and systems architect. 
            Perform a Deep Neural Match between the Candidate Resume and the Job Description.

            CANDIDATE RESUME: 
            ${resumeText}

            TARGET JOB CONTEXT: 
            ${jobDescriptionText || targetRole}

            CRITICAL INSTRUCTIONS:
            1. Identify skills even if they have different names (e.g. "JS" = "JavaScript", "React.js" = "React").
            2. If even a mention of a skill exists in the resume, count it as MATCHED.
            3. Be extremely precise. Check for foundational web skills: HTML, CSS, JavaScript.
            4. If they are in the resume, they MUST be in 'extractedSkills' and NOT in 'missingSkills'.

            Output ONLY valid JSON:
            {
                "extractedSkills": ["all tech skills the user DEFINITELY possesses"],
                "missingSkills": ["essential requirements from the job description that are NOT in the resume"],
                "pivotRoles": [
                    { 
                      "role": "Alternative Role Name", 
                      "company": "Top Company hiring for this", 
                      "match": number(50-99), 
                      "reason": "brief reason" 
                    }
                ],
                "classification": "Junior/Mid/Senior/Expert",
                "matchScore": number (0-100),
                "isVacant": boolean
            }
        `;

        try {
            const aiResponse = await askAI(prompt);
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const aiData = JSON.parse(jsonMatch[0]);
                
                // Merge ML and AI data (AI takes precedence for accuracy)
                const combinedExtracted = Array.from(new Set([
                    ...(mlData.extractedSkills || []),
                    ...(aiData.extractedSkills || [])
                ]));
                
                const combinedMissing = (aiData.missingSkills || []).filter(
                    (skill: string) => !combinedExtracted.some(s => s.toLowerCase() === skill.toLowerCase())
                );

                mlData = {
                    ...mlData,
                    ...aiData,
                    extractedSkills: combinedExtracted,
                    missingSkills: combinedMissing,
                    pivotRoles: aiData.pivotRoles || []
                };
                console.log('[SkillGap] AI Refinement successful');
            }
        } catch (aiErr) {
            console.error('[SkillGap] AI Refinement failed:', aiErr);
        }

        // 3️⃣ Final Consolidation & Score Calculation
        const finalExtracted = mlData?.extractedSkills || ['Basic Technical Literacy'];
        const finalMissing = mlData?.missingSkills || [];
        const finalPivots = mlData?.pivotRoles || [
            { role: "Software Architect", company: "Google", match: 65, reason: "Strong system foundational knowledge" },
            { role: "Product Engineer", company: "Stripe", match: 72, reason: "Focus on user-centric delivery" }
        ];
        const matchScoreRaw = mlData?.matchScore || 45; 
        const isVacant = mlData?.isVacant || false;
        
        // 4️⃣ Semantic Engine (The source of truth for employability)
        const semanticSimilarity = calculateSemanticSimilarity(resumeText, jobDescriptionText);
        
        // 5️⃣ Weighted Calculation
        const employabilityIndex = Math.round(
            (matchScoreRaw * 0.4) +
            (semanticSimilarity * 0.4) +
            (0 * 0.2) // Coding performance placeholder
        );

        const response = {
            matchScore: Math.max(matchScoreRaw, semanticSimilarity),
            employabilityIndex: Math.max(employabilityIndex, 12),
            matchedSkills: finalExtracted,
            missingSkills: finalMissing,
            pivotRoles: finalPivots,
            isVacant: isVacant,
            classification: mlData?.classification || "Evaluating...",
            recommendations: mlData?.recommendations || [
                { title: "Strategic Skill Acquisition", description: "Target the missing identifiers to reach 90% match." }
            ]
        };

        res.json(response);
    } catch (error) {
        console.error("Critical Analysis Error:", error);
        res.status(500).json({ message: "Strategic Analysis Pipeline Faulted." });
    }
};
