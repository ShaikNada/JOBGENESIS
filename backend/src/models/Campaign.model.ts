import { Schema, model, Document } from "mongoose";

export interface ICampaign extends Document {
    recruiterId: Schema.Types.ObjectId;
    companyName: string;
    targetRole: string;
    experienceLevel: string;
    isActive: boolean;
    shareableLink: string;
    createdAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
    {
        recruiterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        companyName: { type: String, required: true },
        targetRole: { type: String, required: true },
        experienceLevel: { type: String, required: true, enum: ["Entry Level", "Mid Level", "Senior", "Lead"] },
        isActive: { type: Boolean, default: true },
        shareableLink: { type: String, required: true, unique: true },
    },
    { timestamps: true }
);

export const Campaign = model<ICampaign>("Campaign", CampaignSchema);
