import { Request, Response } from "express";
import { analyzeResume } from "../services/ai/resumeService";
import { createRequire } from "module";
import { User } from "../models/User.model";
const cjsRequire = createRequire(import.meta.url);

export const extractTextAndAnalyze = async (req: Request, res: Response) => {
    const multerReq = req as any;
    try {
        console.log("📄 Resume upload received");

        if (!multerReq.file) {
            console.log("❌ No file in request");
            return res.status(400).json({ message: "No file uploaded" });
        }

        console.log("📋 File details:", {
            filename: multerReq.file.originalname,
            mimetype: multerReq.file.mimetype,
            size: multerReq.file.buffer.length
        });

        let resumeText = "";
        const buffer = multerReq.file.buffer;
        const mimetype = multerReq.file.mimetype;

        if (mimetype === "application/pdf") {
            console.log("🔍 Parsing PDF...");
            // Fix: pdf-parse v2 uses class-based API
            const { PDFParse } = cjsRequire("pdf-parse");
            const parser = new PDFParse({ data: buffer });
            const data = await parser.getText();
            await parser.destroy();
            resumeText = data.text;
            console.log("✅ PDF extracted, text length:", resumeText.length);
        } else if (
            mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            console.log("🔍 Parsing DOCX...");
            const mammoth = cjsRequire("mammoth");
            const result = await mammoth.extractRawText({ buffer });
            resumeText = result.value;
            console.log("✅ DOCX extracted, text length:", resumeText.length);
        } else {
            console.log("❌ Unsupported file type:", mimetype);
            return res.status(400).json({ message: "Unsupported file type. Please upload a PDF or DOCX file." });
        }

        if (!resumeText.trim()) {
            console.log("❌ Extracted text is empty");
            return res.status(400).json({ message: "Could not extract text from file." });
        }

        console.log("📝 First 200 chars of extracted text:", resumeText.slice(0, 200));
        console.log("🤖 Sending to AI for analysis...");

        // Now analyze the extracted text
        const analysis = await analyzeResume(resumeText);

        // PERSIST TO USER PROFILE IF AUTHENTICATED
        const userId = (req as any).user?._id;
        if (userId) {
            await User.findByIdAndUpdate(userId, { resumeData: analysis });
            console.log("💾 Analysis persisted to user profile:", userId);
        }

        console.log("✅ AI Analysis complete:", {
            name: analysis.personalInfo?.name,
            skillsCount: analysis.skills?.length,
            experienceLevel: analysis.experienceLevel
        });

        res.json(analysis);
    } catch (error) {
        console.error("❌ Resume Extraction Error:", error);
        res.status(500).json({ message: "Failed to parse resume", error: error instanceof Error ? error.message : error });
    }
};

export const analyzePlainResumeText = async (req: Request, res: Response) => {
    try {
        console.log("📝 Plain text analysis received");
        const { resumeText } = req.body;

        if (!resumeText || !resumeText.trim()) {
            console.log("❌ No resume text in request");
            return res.status(400).json({ message: "No resume text provided." });
        }

        console.log("📊 Text length:", resumeText.length);
        console.log("🤖 Sending to AI for analysis...");

        const analysis = await analyzeResume(resumeText);

        const userId = (req as any).user?._id;
        if (userId) {
            await User.findByIdAndUpdate(userId, { resumeData: analysis });
            console.log("💾 Plain text analysis persisted to user profile:", userId);
        }

        console.log("✅ AI Analysis complete:", {
            name: analysis.personalInfo?.name,
            skillsCount: analysis.skills?.length,
            experienceLevel: analysis.experienceLevel
        });

        res.json(analysis);
    } catch (error) {
        console.error("❌ Plain Text Analysis Error:", error);
        res.status(500).json({ message: "Failed to analyze resume text", error: error instanceof Error ? error.message : error });
    }
};

