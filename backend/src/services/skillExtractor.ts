import { Skill, ISkill } from '../models/Skill.model';

/**
 * Normalizes text to make deterministic matching easier.
 */
const normalizeText = (text: string) => {
    return text.toLowerCase().replace(/[^\w\s+]/g, ' '); // keep + for C++
};

/**
 * Core engine. No LLM used. Pure mathematical regex/keyword intersection.
 */
export const extractSkills = async (text: string): Promise<ISkill[]> => {
    const normalized = normalizeText(text);
    const allSkills = await Skill.find({});

    const matchedSkills: ISkill[] = [];

    allSkills.forEach(skill => {
        const skillName = skill.name.toLowerCase();

        // Exact word boundary match to prevent "java" matching inside "javascript"
        const regex = new RegExp(`\\b${skillName.replace('+', '\\+')}\\b`, 'g');

        if (regex.test(normalized)) {
            matchedSkills.push(skill);
        } else {
            // Check synonyms/related skills as a fallback
            for (const related of skill.relatedSkills) {
                const relRegex = new RegExp(`\\b${related.toLowerCase().replace('+', '\\+')}\\b`, 'g');
                if (relRegex.test(normalized)) {
                    // We found a strong related keyword, assume they have the parent skill
                    // In a production Hackathon scale, this would be more granular.
                    matchedSkills.push(skill);
                    break;
                }
            }
        }
    });

    // Deduplicate
    return Array.from(new Set(matchedSkills));
};
