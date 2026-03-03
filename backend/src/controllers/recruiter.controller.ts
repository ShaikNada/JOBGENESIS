import { Request, Response } from "express";
import { Campaign } from "../models/Campaign.model";
import { Mission } from "../models/Mission.model";
import crypto from "crypto";

export const createCampaign = async (req: Request, res: Response) => {
    try {
        const { companyName, targetRole, experienceLevel } = req.body;
        const recruiterId = (req as any).user.id; // From protect middleware

        // Validate
        if (!companyName || !targetRole || !experienceLevel) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        // Generate a unique shareable hash for the URL
        const hash = crypto.randomBytes(8).toString("hex");
        const shareableLink = `/gauntlet/${hash}`;

        const campaign = new Campaign({
            recruiterId,
            companyName,
            targetRole,
            experienceLevel,
            shareableLink
        });

        await campaign.save();

        res.status(201).json({ campaign });
    } catch (error: any) {
        console.error("❌ Error creating campaign:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getRecruiterCampaigns = async (req: Request, res: Response) => {
    try {
        const recruiterId = (req as any).user.id;
        const campaigns = await Campaign.find({ recruiterId }).sort({ createdAt: -1 });

        // We also want to know how many candidates took each campaign
        const enrichedCampaigns = await Promise.all(campaigns.map(async (camp) => {
            const candidateCount = await Mission.countDocuments({ campaignId: camp._id });
            return {
                ...camp.toObject(),
                candidateCount
            };
        }));

        res.status(200).json(enrichedCampaigns);
    } catch (error: any) {
        res.status(500).json({ message: "Server Error" });
    }
};

export const getCampaignLeaderboard = async (req: Request, res: Response) => {
    try {
        const { campaignId } = req.params;
        const recruiterId = (req as any).user.id;

        const campaign = await Campaign.findOne({ _id: campaignId, recruiterId });
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found or unauthorized." });
        }

        // Fetch all missions tagged with this campaign, sort by Employability Index descending
        const results = await Mission.find({ campaignId })
            .populate("userId", "name email avatar")
            .sort({ employabilityIndex: -1 });

        res.status(200).json({ campaign, candidates: results });
    } catch (error: any) {
        res.status(500).json({ message: "Server Error" });
    }
};

export const getCampaignByHash = async (req: Request, res: Response) => {
    try {
        // Public route for candidates visiting the shareable link
        const { hash } = req.params;
        const shareableLink = `/gauntlet/${hash}`;

        const campaign = await Campaign.findOne({ shareableLink, isActive: true });
        if (!campaign) {
            return res.status(404).json({ message: "This interview link is invalid or has expired." });
        }

        // Only return public data needed to start the gauntlet
        res.status(200).json({
            campaignId: campaign._id,
            companyName: campaign.companyName,
            targetRole: campaign.targetRole,
            experienceLevel: campaign.experienceLevel
        });
    } catch (error: any) {
        res.status(500).json({ message: "Server Error" });
    }
};
