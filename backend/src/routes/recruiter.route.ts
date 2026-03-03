import express from "express";
import { protect } from "../middleware/auth.middleware";
import {
    createCampaign,
    getRecruiterCampaigns,
    getCampaignLeaderboard,
    getCampaignByHash
} from "../controllers/recruiter.controller";

const router = express.Router();

// Protected Recruiter Routes
router.post("/campaigns", protect, createCampaign);
router.get("/campaigns", protect, getRecruiterCampaigns);
router.get("/campaigns/:campaignId/leaderboard", protect, getCampaignLeaderboard);

// Public Candidate Routes (Accessing via the invite link)
router.get("/invite/:hash", getCampaignByHash);

export default router;
