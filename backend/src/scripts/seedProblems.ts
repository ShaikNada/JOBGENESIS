import "dotenv/config"; // ✅ THIS IS THE FIX
import mongoose from "mongoose";
import Problem from "../models/Problem";

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error("❌ MONGO_URI missing in environment");
  }

  await mongoose.connect(process.env.MONGO_URI);

  await Problem.deleteMany({});

  await Problem.insertMany([
    {
      title: "Two Sum",
      slug: "two-sum",
      difficulty: "Easy",
      functionName: "twoSum",
      description: "Return indices of two numbers that add up to target.",
      starterCode: {
        javascript: "var twoSum = function(nums, target) {\n\n};"
      },
      testCases: [
        { input: [[2,7,11,15], 9], expected: [0,1] },
        { input: [[3,2,4], 6], expected: [1,2] },
        { input: [[3,3], 6], expected: [0,1], hidden: true }
      ]
    }
  ]);

  console.log("✅ Problems seeded successfully");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
