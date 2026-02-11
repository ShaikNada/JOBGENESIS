import vm from "vm";

export function runJavaScript(
  code: string,
  testCases: any[],
  functionName: string
) {
  let passCount = 0;
  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const { input, expected } = testCases[i];

    try {
      const sandbox: any = {};
      vm.createContext(sandbox);

      const wrapped = `
        ${code}
        result = ${functionName}(...${JSON.stringify(input)});
      `;

      vm.runInContext(wrapped, sandbox, { timeout: 1000 });

      const actual = sandbox.result;
      const passed =
        JSON.stringify(actual) === JSON.stringify(expected);

      if (passed) passCount++;

      results.push({
        case: `Case ${i + 1}`,
        status: passed ? "Passed" : "Failed",
        input: JSON.stringify(input),
        expected: JSON.stringify(expected),
        actual: JSON.stringify(actual)
      });

    } catch (e: any) {
      results.push({
        case: `Case ${i + 1}`,
        status: "Failed",
        input: JSON.stringify(input),
        expected: JSON.stringify(expected),
        actual: e.message
      });
    }
  }

  return {
    passed: passCount === testCases.length,
    passCount,
    totalTests: testCases.length,
    results
  };
}
