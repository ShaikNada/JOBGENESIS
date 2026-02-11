// src/lib/gemini.ts
const API_BASE = "http://localhost:4000/api/ai";

export async function generateCodingChallenge(
  role: string,
  company: string,
  stage: number,
  experienceLevel: string
) {
  const res = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, company, stage, experienceLevel })
  });

  if (!res.ok) throw new Error("Generate failed");
  return res.json();
}

export async function evaluateCode(
  code: string,
  problemDescription: string,
  language: string,
  mode: string,
  customInput?: string,
  problemId?: string
) {
  const res = await fetch(`${API_BASE}/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      problemDescription,
      language,
      mode,
      customInput,
      problemId
    })
  });

  if (!res.ok) throw new Error("Evaluate failed");
  return res.json();
}
export async function chatWithInterviewer(
  history: any[],
  message: string,
  code: string,
  problem: string
) {
  // handleHintUsed removed from here as hint tracking is handled by AI Assistant internally
  const res = await fetch(`${API_BASE}/assist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      history,
      message,
      code,
      problem
    })
  });

  if (!res.ok) {
    throw new Error("Assistant failed");
  }

  const data = await res.json();
  return data.reply;
}
