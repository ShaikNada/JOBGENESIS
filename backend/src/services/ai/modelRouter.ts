import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

// 🌐 Load all available Gemini keys from environment
const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean) as string[];

// 🗄️ Model Priority
const GEMINI_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-pro"
];

// 🤖 Initialize client pools
const geminiPool = GEMINI_KEYS.map(key => new GoogleGenerativeAI(key));
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

/**
 * Gets a random or round-robin client from the pool for external use
 */
export function getAIClient() {
  if (geminiPool.length === 0) return null;
  const idx = Math.floor(Math.random() * geminiPool.length);
  return geminiPool[idx];
}

// Tracking for round-robin balancing (optional but helpful)
let currentKeyIndex = 0;

/**
 * Intelligent AI Router with Multi-Key Rotation and Backoff
 * Designed to eliminate "429 Rate Limit" and "503 Busy" errors during hackathons.
 */
export async function askAI(prompt: string): Promise<string> {
  console.log(`🤖 AI Query Initiated (Pool Size: ${geminiPool.length} keys)`);

  // 1️⃣ Try Gemini Pool first
  for (let keyOffset = 0; keyOffset < geminiPool.length; keyOffset++) {
    const keyIdx = (currentKeyIndex + keyOffset) % geminiPool.length;
    const client = geminiPool[keyIdx];

    for (const modelName of GEMINI_MODELS) {
      try {
        const model = client.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        if (text) {
          // Success! Update index for next time to balance load
          currentKeyIndex = (keyIdx + 1) % geminiPool.length;
          return text;
        }
      } catch (err: any) {
        const isRateLimit = err.message?.includes("429") || err.message?.includes("rate limit");
        console.warn(`⚠️ Gemini Key ${keyIdx + 1} (${modelName}) ${isRateLimit ? "rate limited" : "busy"}. Rotating...`);
        
        // Small delay to allow API breather before trying next model/key
        await new Promise(resolve => setTimeout(resolve, 200));
        continue;
      }
    }
  }

  // 2️⃣ Fallback to Groq (Llama-3.3-70B)
  console.log("🔥 All Gemini keys exhausted or busy. Falling back to Groq Neural Engine.");
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }]
    });

    return completion.choices[0].message.content ?? "";
  } catch (err) {
    console.error("❌ Groq High-Availability Fallback failed:", err);
    throw new Error("AI_SYSTEM_TOTAL_OUTAGE");
  }
}
