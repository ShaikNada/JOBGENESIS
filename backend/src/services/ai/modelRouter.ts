import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
console.log("ENV CHECK:", {
  GEMINI: !!process.env.GEMINI_API_KEY,
  GROQ: !!process.env.GROQ_API_KEY
});

// ✅ Define Gemini models (THIS WAS MISSING)
const GEMINI_MODELS = [
  "gemma-3-4b-it",
  "gemini-3-flash-preview",
  "gemini-3-pro-preview",
  "gemini-2.5-pro",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-pro"
];


const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function askAI(prompt: string): Promise<string> {
  // 1️⃣ Try Gemini first
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = gemini.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err: any) {
      if (
        err?.message?.includes("429") ||
        err?.message?.includes("503")
      ) {
        console.warn(`Gemini ${modelName} busy, trying next...`);
        continue;
      }
      throw err;
    }
  }

  // 2️⃣ Fallback to Groq
  try {
    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }]
    });

    return completion.choices[0].message.content ?? "";
  } catch (err) {
    console.error("Groq failed:", err);
    throw new Error("AI_UNAVAILABLE");
  }
}
