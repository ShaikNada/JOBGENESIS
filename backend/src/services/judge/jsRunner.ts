import ivm from "isolated-vm";

export async function runJavaScript(
  code: string,
  testCases: any[],
  functionName: string
) {
  // 1. Create Isolate with memory limit (128MB)
  const isolate = new ivm.Isolate({ memoryLimit: 128 });
  const context = await isolate.createContext();
  const jail = context.global;

  try {
    // 2. Set strict timeout for execution
    const TIMEOUT_MS = 1000;

    await jail.set("global", jail.derefInto());

    // 3. Define the Test Runner Script within the Sandbox
    const testRunnerScript = `
      function runTests(testCasesJson, funcName) {
        const testCases = JSON.parse(testCasesJson);
        const results = [];
        let passCount = 0;

        // Ensure the user's function exists
        const userFunc = global[funcName];
        if (typeof userFunc !== 'function') {
             throw new Error("Function '" + funcName + "' is not defined. Did you change the function name?");
        }

        for (let i = 0; i < testCases.length; i++) {
          const { input, expected } = testCases[i];
          try {
            // Assume input is an array of arguments
            const result = userFunc(...input);

            // Simple equality check (JSON stringify matches original implementation)
            const actual = result;
            const passed = JSON.stringify(actual) === JSON.stringify(expected);

            if (passed) passCount++;

            results.push({
              case: "Case " + (i + 1),
              status: passed ? "Passed" : "Failed",
              input: JSON.stringify(input),
              expected: JSON.stringify(expected),
              actual: JSON.stringify(actual)
            });
          } catch (e) {
            results.push({
              case: "Case " + (i + 1),
              status: "Failed",
              input: JSON.stringify(input),
              expected: JSON.stringify(expected),
              actual: "Error: " + e.message
            });
          }
        }

        return JSON.stringify({
          passed: passCount === testCases.length,
          passCount,
          totalTests: testCases.length,
          results
        });
      }
    `;

    // 4. Inject the user's code
    await context.eval(code, { timeout: TIMEOUT_MS });

    // 5. Compile the runner
    await context.eval(testRunnerScript, { timeout: TIMEOUT_MS });

    // 6. Get Reference to the runner function
    const runTestsRef = await jail.get("runTests");

    // 7. Execute the runner with serialized data
    const testCasesJson = JSON.stringify(testCases);
    const resultJson = await runTestsRef.apply(
      undefined,
      [testCasesJson, functionName],
      { timeout: TIMEOUT_MS }
    );

    // 8. Parse results back
    return JSON.parse(resultJson as string);

  } catch (error: any) {
    // Handle security violations or runtime errors
    return {
      passed: false,
      passCount: 0,
      totalTests: testCases.length,
      results: [],
      feedback: "Execution Error: " + error.message
    };
  } finally {
    // 9. Cleanup Isolate
    isolate.dispose();
  }
}
