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
    rank: {
        type: String,
        required: true,
    },
    feedback: {
        type: String,
        default: "",
    },
    completedAt: {
        type: Date,
        default: Date.now,
    }
});

export const Mission = mongoose.model("Mission", missionSchema);
