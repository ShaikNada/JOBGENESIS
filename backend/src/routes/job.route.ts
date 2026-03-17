import { Router } from "express";
import { 
    matchJobs, 
    analyzeGap, 
    analyzeTargetPath, 
    saveMissionResult, 
    getUserMissions, 
    startMission, 
    updateMissionProgress 
} from "../controllers/job.controller";
import { protect } from "../middleware/auth.middleware";

export const jobRouter = Router();

jobRouter.post("/match", matchJobs);
jobRouter.post("/gap-analysis", analyzeGap);
jobRouter.post("/target-path", analyzeTargetPath);
jobRouter.post("/save-result", protect as any, saveMissionResult);
jobRouter.post("/start-mission", protect as any, startMission);
jobRouter.patch("/mission/:id/progress", protect as any, updateMissionProgress);
jobRouter.get("/history", protect as any, getUserMissions);
