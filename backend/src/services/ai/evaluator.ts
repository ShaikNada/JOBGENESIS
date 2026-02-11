import { getProblemFromDB } from "../problems/problemService";
import { askAI } from "./modelRouter";
import { buildGeneratePrompt, buildEvaluatePrompt, buildDomainSpecificPrompt } from "./promptBuilder";
import { Problem } from "../../models/Problem.model";

/**
 * Generate a coding challenge (DB → optional AI polish)
 */
export async function generateChallenge(payload: any) {
  const problem = await getProblemFromDB(payload);

  let aiData: any = null;
  try {
    // 🟠 ROUND 3 / DOMAIN SPECIFIC LOGIC (Or fallback if DB empty)
    // If we are in Stage 3, OR if no problem was found in DB
    if (!problem || payload.stage === 3) {
      console.log("🤖 Generating Domain-Specific Problem via AI...");

      const domainPrompt = buildDomainSpecificPrompt({
        role: payload.role || "Software Engineer",
        experienceLevel: payload.experienceLevel || "Mid",
        company: payload.company || "Tech Corp"
      });

      const raw = await askAI(domainPrompt);
      const cleaned = raw.replace(/```json|```/g, "").trim();
      aiData = JSON.parse(cleaned);

      // 💾 PERSISTENCE: Save this new problem to DB
      try {
        const newProblem = await Problem.create({
          id: `ai-${Date.now()}`,
          title: aiData.title,
          difficulty: aiData.difficulty || "Medium",
          description: aiData.description,
          starterCode: {
            javascript: aiData.starterCode?.javascript || "// JS starter",
            python: aiData.starterCode?.python || "# Python starter",
            java: aiData.starterCode?.java || "// Java starter",
            cpp: aiData.starterCode?.cpp || "// C++ starter"
          },
          examples: [],
          tags: ["AI-Generated", payload.role || "General"],
          companies: [payload.company || "Unknown"]
        });
        console.log("✅ AI Problem Saved to DB:", newProblem._id);
      } catch (dbErr) {
        console.error("⚠️ Failed to save AI problem to DB:", dbErr);
      }

      return {
        title: aiData.title,
        description: aiData.description,
        starterCode: aiData.starterCode,
        visualType: aiData.visualType || "Flowchart",
        visualData: aiData.visualData || []
      };
    }

    // 🟢 STANDARD ROUNDS (1 & 2) - Existing Logic
    // 1️⃣ Build AI prompt from REAL DB problem
    const prompt = buildGeneratePrompt({
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      starterCode: problem.starterCode
    });

    // 2️⃣ Ask AI (Gemini / Groq)
    const raw = await askAI(prompt);

    // 3️⃣ Clean + parse AI response
    const cleaned = raw.replace(/```json|```/g, "").trim();
    aiData = JSON.parse(cleaned);

    // 4️⃣ HARD SAFETY (frontend will NEVER crash)
    const dbStarter = problem.starterCode as any;

    return {
      title: problem.title,
      description: problem.description,
      starterCode: {
        javascript: aiData?.starterCode?.javascript || dbStarter?.javascript || "// JS Implement here",
        python: aiData?.starterCode?.python || dbStarter?.python || "# Python Implement here",
        java: aiData?.starterCode?.java || dbStarter?.java || "// Java Implement here",
        cpp: aiData?.starterCode?.cpp || dbStarter?.cpp || "// C++ Implement here"
      },
      visualType: aiData?.visualType ?? "Flowchart",
      visualData: Array.isArray(aiData?.visualData) ? aiData.visualData : []
    };
  } catch (err) {
    console.error("AI GENERATION FAILED, FALLING BACK TO DB:", err);

    if (!problem) {
      // Absolute fallback if everything fails
      return {
        title: "System Error",
        description: "Could not load problem profile. Technical simulation unavailable.",
        starterCode: {
          javascript: "// Error loading problem",
          python: "# Error",
          java: "// Error",
          cpp: "// Error"
        },
        visualType: "Flowchart",
        visualData: []
      };
    }

    // Fallback to DB data
    const dbStarter = problem.starterCode as any;
    return {
      title: problem.title,
      description: problem.description,
      starterCode: {
        javascript: dbStarter?.javascript || "// JS Implement here",
        python: dbStarter?.python || "# Python Implement here",
        java: dbStarter?.java || "// Java Implement here",
        cpp: dbStarter?.cpp || "// C++ Implement here"
      },
      visualType: "Flowchart",
      visualData: []
    };
  }
}


/**
 * Evaluate a code submission
 */
export async function evaluateSubmission(payload: any) {
  const { code, language, problemId, mode, customInput } = payload;

  // 🚫 HARD FAIL: empty / fake code
  if (!code || code.trim().length < 15) {
    return {
      passed: false,
      passCount: 0,
      totalTests: 0,
      results: [],
      feedback: "No meaningful logic implemented"
    };
  }

  // 🧪 Custom input = dry run only (no judging)
  if (mode === "custom") {
    return {
      passed: true,
      passCount: 0,
      totalTests: 0,
      results: [],
      feedback: "Custom input executed (not evaluated)"
    };
  }

  // 🤖 AI-assisted evaluation (temporary, replace with sandbox later)
  const prompt = buildEvaluatePrompt(payload);
  const raw = await askAI(prompt);

  return JSON.parse(
    raw.replace(/```json/g, "").replace(/```/g, "").trim()
  );
}
