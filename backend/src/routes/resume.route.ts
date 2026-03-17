import { Router } from "express";
import multer from "multer";
import { extractTextAndAnalyze, analyzePlainResumeText } from "../controllers/resume.controller";
import { protect } from "../middleware/auth.middleware";

const upload = multer({ storage: multer.memoryStorage() });
export const resumeRouter = Router();

resumeRouter.post("/upload", protect as any, upload.single("resume"), extractTextAndAnalyze);
resumeRouter.post("/analyze-text", protect as any, analyzePlainResumeText);
