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
  }
});

export const Problem = model("Problem", ProblemSchema);
