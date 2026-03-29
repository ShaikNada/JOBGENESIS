import { Schema, model, Document, Types } from "mongoose";

export interface ITurn {
    question: string;
    transcript: string;
    feedback: string;
    communicationScore: number;
    technicalAccuracyScore: number;
    timestamp: Date;
}

export interface IInterview extends Document {
    candidateId: Types.ObjectId;
    problemId?: Types.ObjectId;
    jobId?: Types.ObjectId;
    problemTitle: string;
    role: string;
    company: string;
    difficulty: string;
    isStressMode: boolean;
    status: 'ongoing' | 'completed';
    turns: ITurn[];
    finalReport?: {
        summary: string;
        overallScore: number;
        avgCommunication: number;
        avgTechnical: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const InterviewSchema = new Schema<IInterview>(
    {
        candidateId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        problemId: { type: Schema.Types.ObjectId, ref: 'Problem' },
        jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
        problemTitle: { type: String, required: true },
        role: { type: String, required: true },
        company: { type: String, required: true },
        difficulty: { type: String, default: 'normal' },
        isStressMode: { type: Boolean, default: false },
        status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
        turns: [{
            question: String,
            transcript: String,
            feedback: String,
            communicationScore: Number,
            technicalAccuracyScore: Number,
            timestamp: { type: Date, default: Date.now }
        }],
        finalReport: {
            summary: String,
            overallScore: Number,
            avgCommunication: Number,
            avgTechnical: Number
        }
    },
    { timestamps: true }
);

export const Interview = model<IInterview>("Interview", InterviewSchema);
