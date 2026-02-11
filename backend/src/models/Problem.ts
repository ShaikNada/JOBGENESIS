import mongoose, { Schema, Document } from "mongoose";

export interface IProblem extends Document {
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  functionName: string;
  starterCode: Map<string, string>;
  testCases: {
    input: any[];
    expected: any;
    hidden?: boolean;
  }[];
}

const ProblemSchema = new Schema<IProblem>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true
    },
    description: { type: String, required: true },
    functionName: { type: String, required: true },

    starterCode: {
      type: Map,
      of: String,
      required: true
    },

    testCases: [
      {
        input: { type: [Schema.Types.Mixed], required: true },
        expected: { type: Schema.Types.Mixed, required: true },
        hidden: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.models.Problem ||
  mongoose.model<IProblem>("Problem", ProblemSchema);
