import dotenv from "dotenv";
dotenv.config();
import { analyzeResume } from "./src/services/ai/resumeService";

async function test() {
    console.log("Testing analyzeResume...");
    try {
        const result = await analyzeResume("John Doe. Software Engineer with 5 years experience in React.");
        console.log("SUCCESS:", JSON.stringify(result, null, 2));
    } catch (err) {
        console.error("FAIL:", err);
    }
}

test();
