import { Router } from "express";
import { evaluateSubmission, generateChallenge } from "../services/ai/evaluator";
import { assistCandidate } from "../services/ai/assistant";

export const aiRouter = Router();

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
