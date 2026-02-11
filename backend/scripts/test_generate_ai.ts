
import "dotenv/config";

import { generateChallenge } from "../src/services/ai/evaluator";
import { connectDB } from "../src/db/connect";

// Mock DB problem fetch (we can't easily mock the DB call inside generateChallenge without DI, 
// so we'll rely on generateChallenge fetching a random problem from DB, which should now work correctly)
// valid payload for getProblemFromDB: { stage: 1 }

async function test() {
    await connectDB();
    console.log("Testing generateChallenge...");
    try {
        const result = await generateChallenge({ stage: 1, role: "Frontend", experienceLevel: "Junior" });
        console.log("Result Title:", result.title);
        console.log("Result Description (snippet):", result.description.substring(0, 50));
        console.log("Starter Code Keys:", Object.keys(result.starterCode));
        console.log("Starter Code JS (snippet):", result.starterCode.javascript.substring(0, 50));
        console.log("Starter Code Java (snippet):", result.starterCode.java.substring(0, 50));

        // logic check
        if (result.starterCode.java.includes("class Solution")) {
            console.log("✅ Java code looks like class Solution");
        } else {
            console.log("⚠️ Java code might be missing class definition");
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

test();
