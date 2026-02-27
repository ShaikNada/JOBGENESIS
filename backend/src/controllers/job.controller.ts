import { Request, Response } from "express";
import { fetchRealJobs } from "../services/jobs/jobSearchService";
import { askAI } from "../services/ai/modelRouter";
import { Mission } from "../models/Mission.model";
import { User } from "../models/User.model";
import { executeCareerPathAnalysis } from "../services/jobs/careerPathService";

// @desc    Get AI-matched jobs based on resume (Real Search)
// @route   POST /api/jobs/match
export const matchJobs = async (req: Request, res: Response) => {
  try {
    const { resumeData } = req.body;

    if (!resumeData) {
      return res.status(400).json({ message: "Resume data required" });
    }

    const primaryRole = resumeData.suggestedRoles?.[0] || resumeData.experienceLevel || "Software Engineer";
    const jobs = await fetchRealJobs(primaryRole, resumeData);

    res.json(jobs);
  } catch (error) {
    console.error("Job Match Error:", error);
    res.status(500).json({ message: "Failed to fetch real jobs" });
  }
};

// @desc    Analyze gap for specific target (Real Intelligent Analysis)
// @route   POST /api/jobs/gap-analysis
export const analyzeGap = async (req: Request, res: Response) => {
  try {
    const { resumeData, targetRole, targetCompany } = req.body;

    if (!resumeData || !targetRole || !targetCompany) {
      return res.status(400).json({ message: "Missing required profile or target data" });
    }

    const prompt = `
      You are a senior technical hiring bar setter.
      Candidate Profile: ${JSON.stringify(resumeData)}
      Target Reality: ${targetRole} at ${targetCompany}

      Analyze the feasibility of this move based on current market expectations.
      Return JSON exactly as follows:
      {
        "match": number (0-100),
        "missingSkills": ["Specific missing professional skill"],
        "advice": "Direct strategic advice on how to bridge this specific gap."
      }
    `;

    const raw = await askAI(prompt);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(cleaned);

    res.json(analysis);
  } catch (error) {
    console.error("Gap Analysis Error:", error);
    res.status(500).json({ message: "Failed to analyze career gap" });
  }
};

// @desc    Analyze career path for target role and company
// @route   POST /api/jobs/target-path
export const analyzeTargetPath = async (req: Request, res: Response) => {
  try {
    const { resumeData, targetRole, targetCompany, level } = req.body;

    if (!resumeData || !targetRole || !targetCompany) {
      return res.status(400).json({ message: "Missing required profile or target data" });
    }

    const analysis = await executeCareerPathAnalysis(resumeData, targetRole, targetCompany, level || "Junior");
    res.json(analysis);
  } catch (error) {
    console.error("Target Path Analysis Error:", error);
    res.status(500).json({ message: "Failed to analyze target path" });
  }
};

// @desc    Save mission result
// @route   POST /api/jobs/save-result
export const saveMissionResult = async (req: Request, res: Response) => {
  try {
    const { role, company, score, rank, feedback, skillTags } = req.body;
    const userId = (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const mission = await Mission.create({
      userId,
      role,
      company,
      score,
      rank,
      feedback,
      skillTags: skillTags || [],
    });

    res.status(201).json(mission);
  } catch (error) {
    console.error("Save Mission Error:", error);
    res.status(500).json({ message: "Failed to save mission result" });
  }
};

// @desc    Get user missions history
// @route   GET /api/jobs/history
export const getUserMissions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const missions = await Mission.find({ userId }).sort({ completedAt: -1 });
    res.json(missions);
  } catch (error) {
    console.error("Fetch Mission History Error:", error);
    res.status(500).json({ message: "Failed to fetch history" });
  }
};
