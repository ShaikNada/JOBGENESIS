import { ISkill } from '../models/Skill.model';

export interface GapAnalysisResult {
    matchedSkills: ISkill[];
    missingSkills: ISkill[];
    matchScoreRaw: number; // 0-100 simple percentage
    weightedScore: number; // 0-100 demand-weighted
}

/**
 * Calculates both raw and weighted skill gaps between candidate and job requirements.
 * Weighted score is calculated as: Sum(demand of matches) / Sum(demand of required)
 */
export const calculateGap = (userSkills: ISkill[], jobSkills: ISkill[]): GapAnalysisResult => {

    // Default to 100% match if the job somehow has no required skills parsed
    if (jobSkills.length === 0) {
        return { matchedSkills: [], missingSkills: [], matchScoreRaw: 100, weightedScore: 100 };
    }

    const matched: ISkill[] = [];
    const missing: ISkill[] = [];

    let totalJobDemand = 0;
    let totalMatchedDemand = 0;

    // Check each required job skill
    jobSkills.forEach(jobSkill => {
        totalJobDemand += jobSkill.demandScore;

        // Ensure we check by name or ID (Mongoose ObjectID needs .equals if comparing IDs)
        const hasSkill = userSkills.some(userS => userS.name === jobSkill.name);

        if (hasSkill) {
            matched.push(jobSkill);
            totalMatchedDemand += jobSkill.demandScore;
        } else {
            missing.push(jobSkill);
        }
    });

    // 1. Raw Percentage (just count)
    const rawScore = (matched.length / jobSkills.length) * 100;

    // 2. Weighted Score (Demand Based)
    const weightedScore = (totalMatchedDemand / totalJobDemand) * 100;

    return {
        matchedSkills: matched,
        missingSkills: missing,
        matchScoreRaw: Math.round(rawScore),
        weightedScore: Math.round(weightedScore)
    };
};
