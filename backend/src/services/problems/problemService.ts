import { Problem } from "../../models/Problem.model";

/**
 * Fetch a real problem from DB based on stage
 */
export async function getProblemFromDB(payload: {
  stage: number;
  role?: string;
  experienceLevel?: string;
}) {
  const { stage } = payload;

  const difficulty =
    stage === 1 ? "Easy" :
      stage === 2 ? "Medium" :
        "Hard";

  const problems = await Problem.find({ difficulty });

  if (!problems.length) {
    throw new Error("NO_PROBLEMS_IN_DB");
  }

  // Random selection (can be made deterministic later)
  const index = Math.floor(Math.random() * problems.length);
  return problems[index];
}
