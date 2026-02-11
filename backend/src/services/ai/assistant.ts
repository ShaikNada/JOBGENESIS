import { askAI } from "./modelRouter";

export async function assistCandidate({
  history,
  message,
  code,
  problem
}: any): Promise<string> {
  const prompt = `
You are JobGenesis Core, a strict technical interviewer.

Rules:
- DO NOT write code
- Guide using concepts only
- Be brief and precise

Problem:
${problem}

Candidate Code:
${code}

Conversation History:
${JSON.stringify(history)}

Candidate Question:
${message}
`;

  return await askAI(prompt);
}
