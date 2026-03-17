import { Router } from "express";
import { awardXP, getSkillTree } from "../services/skillTree.service";
import { protect } from "../middleware/auth.middleware";

export const skillTreeRouter = Router();

// GET /api/skill-tree — Fetch the current user's skill tree + badges
skillTreeRouter.get("/", protect as any, async (req: any, res) => {
    try {
        const data = await getSkillTree(req.user._id.toString());
        if (!data) return res.status(404).json({ message: "User not found" });
        return res.json(data);
    } catch (e) {
        console.error("Skill tree fetch error:", e);
        return res.status(500).json({ message: "Failed to load skill tree" });
    }
});

// POST /api/skill-tree/award — Award XP (called internally from controllers)
skillTreeRouter.post("/award", protect as any, async (req: any, res) => {
    try {
        const { event, domains, isBounty, difficulty } = req.body;
        const result = await awardXP(req.user._id.toString(), event, domains, isBounty, difficulty);
        return res.json(result);
    } catch (e) {
        console.error("XP award error:", e);
        return res.status(500).json({ message: "Failed to award XP" });
    }
});
