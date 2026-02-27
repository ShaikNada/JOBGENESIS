import { Router } from "express";
import { evaluateSubmission, generateChallenge, generateTechnicalExam } from "../services/ai/evaluator";
import { assistCandidate } from "../services/ai/assistant";

export const aiRouter = Router();

aiRouter.post("/technical-exam", async (req, res) => {
  try {
    const result = await generateTechnicalExam(req.body);
    res.json(result);
  } catch (e) {
    console.error("EXAM GENERATION ERROR:", e);
    res.status(500).json({ error: "EXAM_GENERATION_FAILED" });
  }
});

aiRouter.post("/generate", async (req, res) => {
  try {
    const result = await generateChallenge(req.body);
    res.json(result);
  } catch (e) {
    console.error("AI GENERATION ERROR:", e);
    res.status(500).json({ error: "AI_GENERATION_FAILED" });
  }
});

aiRouter.post("/evaluate", async (req, res) => {
  try {
    const result = await evaluateSubmission(req.body);
    res.json(result);
  } catch (e) {
    res.json({
      passed: false,
      passCount: 0,
      totalTests: 10,
      feedback: "AI temporarily unavailable"
    });
  }
});
aiRouter.post("/assist", async (req, res) => {
  try {
    const { history, message, code, problem } = req.body;

    const result = await assistCandidate({
      history,
      message,
      code,
      problem
    });

    res.json({ reply: result });
  } catch {
    res.json({ reply: "Assistant temporarily unavailable." });
  }
});

aiRouter.post("/analyze-complexity", async (req, res) => {
  try {
    const { analyzeComplexity } = await import("../services/ai/evaluator");
    const result = await analyzeComplexity(req.body);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: "Complexity analysis failed" });
  }
});

aiRouter.post("/hint", async (req, res) => {
  try {
    const { generateHint } = await import("../services/ai/evaluator");
    const result = await generateHint(req.body);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: "Hint generation failed" });
  }
});
