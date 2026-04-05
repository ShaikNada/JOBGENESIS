import { Router } from "express";
import { generateCareerPath } from "../controllers/career.controller";
import { protect } from "../middleware/auth.middleware";

export const careerRouter = Router();

// Endpoint for AI career intelligence (skill gap/pathing)
careerRouter.post("/path", protect, generateCareerPath);
