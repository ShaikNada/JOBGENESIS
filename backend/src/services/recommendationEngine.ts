import { ISkill } from '../models/Skill.model';

export interface SkillRecommendation {
    skillName: string;
    missingDemandScore: number;
    resources: { title: string; url: string; type: string }[];
}

/**
 * Iterates through missing skills and structures a prioritized list of learning resources.
 */
export const generateRecommendations = (missingSkills: ISkill[]): SkillRecommendation[] => {
    // Sort by most impactful skills first (highest demand score)
    const sortedSkills = [...missingSkills].sort((a, b) => b.demandScore - a.demandScore);

    return sortedSkills.map(skill => {
        return {
            skillName: skill.name,
            missingDemandScore: skill.demandScore,
            resources: skill.learningResources // Already structured from the Mongoose model
        };
    });
};
