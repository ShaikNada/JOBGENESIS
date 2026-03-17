import { Router } from "express";
import { Problem } from "../models/Problem.model";

export const problemsRouter = Router();

problemsRouter.get("/bounties", async (_req, res) => {
  try {
    const bounties = await Problem.find({ tags: "auto-generated" }).sort({ _id: -1 }).limit(20);
    res.json(bounties);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bounties" });
  }
});

problemsRouter.get("/:id", async (req, res) => {
  try {
    const problem = await Problem.findOne({ id: req.params.id });
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch problem" });
  }
});

problemsRouter.get("/", async (_req, res) => {
  const problems = await Problem.find().limit(100);
  res.json(problems);
});
