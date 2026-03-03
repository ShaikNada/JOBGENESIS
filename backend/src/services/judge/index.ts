import { codeQueue } from "./queue";
import { Problem } from "../../models/Problem.model";

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

  // Add to queue and wait for the worker to process it
  const job = await codeQueue.add('execute', {
    code,
    testCases: problem.testCases,
    functionName: problem.functionName
  });

  try {
    // Wait for the result with a timeout (e.g., 5 seconds)
    const result = await job.waitUntilFinished(new (require('bullmq').QueueEvents)('code-execution', {
      connection: codeQueue.opts.connection
    }));
    return result;
  } catch (err: any) {
    return fail("Execution timed out or failed in worker: " + err.message);
  }
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
