import { Request, Response } from "express";
import { fetchRealJobs } from "../services/jobs/jobSearchService";
import { askAI } from "../services/ai/modelRouter";
import { Mission } from "../models/Mission.model";
import { processMissionForCAL } from "../services/ai/calService";
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

// @desc    Start a new mission (creates entry for tracking)
// @route   POST /api/jobs/start-mission
export const startMission = async (req: Request, res: Response) => {
  try {
    const { role, company, campaignId } = req.body;
    const userId = (req as any).user?._id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const mission = await Mission.create({
      userId,
      role,
      company,
      campaignId: campaignId || undefined,
      score: 0,
      rank: "B", // Initial rank
      progression: {
        assessmentStartedAt: new Date()
      }
    });

    res.status(201).json(mission);
  } catch (error) {
    console.error("Start Mission Error:", error);
    res.status(500).json({ message: "Failed to initialize mission" });
  }
};

// @desc    Update mission progression
// @route   PATCH /api/jobs/mission/:id/progress
export const updateMissionProgress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stage } = req.body; // e.g. 'coding-started'

    const mission = await Mission.findById(id);
    if (!mission) return res.status(404).json({ message: "Mission not found" });

    const progression: any = mission.progression || {};
    const now = new Date();

    if (stage === 'assessment-completed') progression.assessmentCompletedAt = now;
    if (stage === 'coding-started') progression.codingStartedAt = now;
    if (stage === 'coding-completed') progression.codingCompletedAt = now;
    if (stage === 'interview-started') progression.interviewStartedAt = now;
    if (stage === 'interview-completed') progression.interviewCompletedAt = now;

    mission.progression = progression;
    await mission.save();

    res.json(mission);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

// @desc    Save mission result
// @route   POST /api/jobs/save-result
export const saveMissionResult = async (req: Request, res: Response) => {
  try {
    const { missionId, role, company, score, rank, feedback, skillTags, employabilityIndex, telemetry } = req.body;
    const userId = (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let mission;
    if (missionId) {
      mission = await Mission.findById(missionId);
      if (mission) {
        mission.score = score;
        mission.rank = rank;
        mission.feedback = feedback;
        mission.skillTags = skillTags || [];
        mission.employabilityIndex = employabilityIndex || 0;
        mission.telemetry = telemetry || mission.telemetry;
        mission.completedAt = new Date();
        await mission.save();
      }
    }

    if (!mission) {
      mission = await Mission.create({
        userId,
        role,
        company,
        score,
        rank,
        feedback,
        skillTags: skillTags || [],
        employabilityIndex: employabilityIndex || 0,
        telemetry: telemetry || undefined,
        completedAt: new Date()
      });
    }

    res.status(201).json(mission);

    // 🔄 Fire-and-forget CAL feedback loop (anonymized)
    processMissionForCAL(mission);
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
