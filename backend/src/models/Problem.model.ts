import { Schema, model } from "mongoose";

const ProblemSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  difficulty: String,
  tags: [String],
  companies: [String],
  description: String,
  examples: [
    {
      input: String,
      output: String
    }
  ],
  starterCode: {
    javascript: { type: String, default: "" },
    python: { type: String, default: "" },
    java: { type: String, default: "" },
    cpp: { type: String, default: "" }
  },
  functionName: { type: String, default: "solution" },
  testCases: [
    {
      input: Schema.Types.Mixed,
      expected: Schema.Types.Mixed
    }
  ],
  isPremium: { type: Boolean, default: false }
});

export const Problem = model("Problem", ProblemSchema);
