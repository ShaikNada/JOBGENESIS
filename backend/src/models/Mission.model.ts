import mongoose from "mongoose";

const missionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    skillTags: [{
        type: String, // Domain #74: Tracks exact verified skills (e.g. ['React', 'Node.js'])
    }],
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campaign",
        required: false, // Optional for normal candidates practicing
    },
    employabilityIndex: {
        type: Number,
        default: 0,
    },
    rank: {
        type: String,
        required: true,
    },
    feedback: {
        type: String,
        default: "",
    },
    progression: {
        assessmentStartedAt: Date,
        assessmentCompletedAt: Date,
        codingStartedAt: Date,
        codingCompletedAt: Date,
        interviewStartedAt: Date,
        interviewCompletedAt: Date,
    },
    telemetry: {
        tabSwitches: { type: Number, default: 0 },
        pasteEvents: { type: Number, default: 0 },
        totalKeystrokes: { type: Number, default: 0 },
        typingIntervals: [Number],
    },
    completedAt: {
        type: Date,
        default: Date.now,
    }
});

export const Mission = mongoose.model("Mission", missionSchema);
