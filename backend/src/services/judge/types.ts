export interface TestCase {
  input: any;
  expected: any;
}

export interface JudgeResult {
  passed: boolean;
  passCount: number;
  totalTests: number;
  results: {
    case: string;
    status: "Passed" | "Failed";
    input: string;
    expected: string;
    actual: string;
  }[];
}
