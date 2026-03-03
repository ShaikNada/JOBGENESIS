import { Schema, model } from "mongoose";

const TrainingDataSchema = new Schema({
    role: { type: String, required: true },
    experienceLevel: String,
    skillTags: [String],
    score: Number,
    technicalAccuracyScore: Number,
    communicationScore: Number,
    finalRank: String,
    // Anonymized behavioral data
    telemetryMetrics: {
        tabSwitchRatio: Number, // switches per minute
        typingStability: Number, // variance in intervals
        pasteCount: Number
    },
    timestamp: { type: Date, default: Date.now }
});

export const TrainingData = model("TrainingData", TrainingDataSchema);
