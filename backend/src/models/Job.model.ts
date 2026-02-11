import { Schema, model, Document } from "mongoose";

export interface IJob extends Document {
    title: string;
    company: string;
    location?: string;
    skills: string[];
    description?: string;
    matchScore?: number; // Dynamic field for user context
}

const JobSchema = new Schema(
    {
        title: { type: String, required: true },
        company: { type: String, required: true },
        location: String,
        skills: [String],
        description: String,
    },
    { timestamps: true }
);

export const Job = model<IJob>("Job", JobSchema);
