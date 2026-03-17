import { codeQueue } from "./queue";
import { Problem } from "../../models/Problem.model";
import { runJavaScript } from "./jsRunner";

export async function deterministicJudge(payload: any) {
  const { code, language, problemId } = payload;

  if (!code || code.trim().length < 15) {
    return fail("No meaningful logic implemented");
  }

  if (language !== "javascript") {
    return fail("Only JavaScript supported for now");
  }

  const problem = await Problem.findOne({
    $or: [
      { _id: problemId.match(/^[0-9a-fA-F]{24}$/) ? problemId : null },
      { id: problemId }
    ]
  });
  if (!problem) return fail("Problem not found");

  // Fallback to direct execution if Redis/Queue is unavailable
  if (!codeQueue) {
    console.log("[Judge] Redis Queue unavailable, falling back to direct execution");
    try {
      const result = await runJavaScript(code, problem.testCases, problem.functionName);
      return result;
    } catch (err: any) {
      return fail("Direct execution failed: " + err.message);
    }
  }

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
