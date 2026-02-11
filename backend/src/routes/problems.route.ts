import { Router } from "express";
import { Problem } from "../models/Problem.model";

export const problemsRouter = Router();

problemsRouter.get("/", async (_req, res) => {
  const problems = await Problem.find().limit(100);
  res.json(problems);
});
