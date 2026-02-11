import { runJavaScript } from "./jsRunner";
import Problem from "../../models/Problem";

export async function deterministicJudge(payload: any) {
  const { code, language, problemId } = payload;

  if (!code || code.trim().length < 15) {
    return fail("No meaningful logic implemented");
  }

  if (language !== "javascript") {
    return fail("Only JavaScript supported for now");
  }

  const problem = await Problem.findById(problemId);
  if (!problem) return fail("Problem not found");

  return runJavaScript(
    code,
    problem.testCases,
    problem.functionName
  );
}

function fail(reason: string) {
  return {
    passed: false,
    passCount: 0,
    totalTests: 0,
    results: [],
    feedback: reason
  };
}
