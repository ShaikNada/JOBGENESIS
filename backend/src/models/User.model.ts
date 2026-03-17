import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface ISkillTree {
    frontend: number;
    backend: number;
    systemDesign: number;
    security: number;
    algorithms: number;
    bountiesSolved: number;
    totalXP: number;
}

export interface IBadge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: Date;
}

export interface IUser extends Document {
    email: string;
    password?: string;
    name: string;
    role: "candidate" | "recruiter" | "admin";
    authProvider: "local" | "google" | "github";
    googleId?: string;
    githubId?: string;
    avatar?: string;
    resumeData?: any;
    isVerified: boolean;
    verificationToken?: string;
    skillTree: ISkillTree;
    badges: IBadge[];
    createdAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String }, // Optional for OAuth users
        name: { type: String, required: true },
        role: { type: String, enum: ["candidate", "recruiter", "admin"], default: "candidate" },
        authProvider: { type: String, required: true, default: "local" },
        googleId: { type: String },
        githubId: { type: String },
        avatar: { type: String },
        resumeData: { type: Schema.Types.Mixed }, // Store parsed resume JSON
        isVerified: { type: Boolean, default: false },
        verificationToken: { type: String },
        skillTree: {
            frontend:     { type: Number, default: 0 },
            backend:      { type: Number, default: 0 },
            systemDesign: { type: Number, default: 0 },
            security:     { type: Number, default: 0 },
            algorithms:   { type: Number, default: 0 },
            bountiesSolved: { type: Number, default: 0 },
            totalXP:      { type: Number, default: 0 }
        },
        badges: [{
            id:          { type: String },
            name:        { type: String },
            description: { type: String },
            icon:        { type: String },
            earnedAt:    { type: Date, default: Date.now }
        }],
    },
    { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err: any) {
        throw err;
    }
});

UserSchema.methods.comparePassword = async function (candidate: string) {
    if (!this.password) return false;
    return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser>("User", UserSchema);
