import { User } from "../models/User.model";

export type SkillDomain = "frontend" | "backend" | "systemDesign" | "security" | "algorithms";

// Domain XP awarded per completed mission event
const XP_PER_EVENT: Record<string, number> = {
    missionComplete: 80,
    bountyComplete: 150,
    stressInterviewPassed: 200,
    examPassed: 40,
};

// Badge definitions — unlock conditions checked after every XP update
const BADGE_DEFINITIONS = [
    {
        id: "guardian",
        name: "The Guardian",
        description: "Solved 5+ Anomaly Bounties from the Dark Net board.",
        icon: "🛡️",
        check: (tree: any) => tree.bountiesSolved >= 5,
    },
    {
        id: "steel_nerves",
        name: "Steel Nerves",
        description: "Survived a Principal-level Stress Interview.",
        icon: "⚡",
        check: (tree: any) => tree.totalXP >= 500 && tree.systemDesign >= 100,
    },
    {
        id: "shadow_architect",
        name: "Shadow Architect",
        description: "Contributed to the Digital Immune System by solving an Anomaly Bounty.",
        icon: "👁️",
        check: (tree: any) => tree.bountiesSolved >= 1,
    },
    {
        id: "algorithm_god",
        name: "Algorithm God",
        description: "Reached 500 XP in algorithmic problem solving.",
        icon: "🧠",
        check: (tree: any) => tree.algorithms >= 500,
    },
    {
        id: "neural_pioneer",
        name: "Neural Pioneer",
        description: "Earned 1000 total XP on the platform.",
        icon: "🚀",
        check: (tree: any) => tree.totalXP >= 1000,
    },
];

/**
 * Awards XP to a user's skill tree across different domains
 * and automatically unlocks any newly-earned badges.
 */
export async function awardXP(
    userId: string,
    event: string,
    domains: SkillDomain[],
    isBounty = false,
    difficulty: 'easy' | 'normal' | 'hard' = 'normal'
) {
    const user = await User.findById(userId);
    if (!user) return null;

    let baseXP = XP_PER_EVENT[event] || 50;

    // Apply difficulty multiplier
    if (difficulty === 'easy') baseXP *= 0.8;
    if (difficulty === 'hard') baseXP *= 1.5;

    const xp = Math.round(baseXP);
    const domainShare = Math.floor(xp / (domains.length || 1));

    // Accumulate XP across the relevant domains
    for (const domain of domains) {
        (user.skillTree as any)[domain] = ((user.skillTree as any)[domain] || 0) + domainShare;
    }
    user.skillTree.totalXP = (user.skillTree.totalXP || 0) + xp;

    if (isBounty) {
        user.skillTree.bountiesSolved = (user.skillTree.bountiesSolved || 0) + 1;
    }

    // Check and unlock badges
    const existingBadgeIds = user.badges.map((b) => b.id);
    for (const def of BADGE_DEFINITIONS) {
        if (!existingBadgeIds.includes(def.id) && def.check(user.skillTree)) {
            user.badges.push({
                id: def.id,
                name: def.name,
                description: def.description,
                icon: def.icon,
                earnedAt: new Date(),
            } as any);
            console.log(`🏅 Badge Unlocked for ${user.name}: ${def.name}`);
        }
    }

    await user.save();
    return { skillTree: user.skillTree, badges: user.badges };
}

/**
 * Fetches a user's complete skill tree and badges.
 */
export async function getSkillTree(userId: string) {
    const user = await User.findById(userId).select("skillTree badges name email");
    if (!user) return null;
    return { skillTree: user.skillTree, badges: user.badges };
}
