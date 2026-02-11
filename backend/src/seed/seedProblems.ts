import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { Problem } from "../models/Problem.model";

// ⚠️ IMPORTANT: import compiled JS data, not TS types
import { PROBLEM_SET } from "../../../src/lib/database/problemSet";

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI!);

  console.log("🧹 Clearing existing problems...");
  await Problem.deleteMany({});

  console.log("🌱 Seeding problems...");
  const normalizedProblems = PROBLEM_SET.map(p => ({
    ...p,
    starterCode: typeof p.starterCode === 'string' ? {
      javascript: p.starterCode,
      python: "# " + p.title + " starter",
      java: "// " + p.title + " starter",
      cpp: "// " + p.title + " starter"
    } : p.starterCode
  }));
  await Problem.insertMany(normalizedProblems);

  console.log(`✅ Seeded ${PROBLEM_SET.length} problems`);
  await mongoose.disconnect();
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
