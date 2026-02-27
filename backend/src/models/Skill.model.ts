import mongoose, { Document, Schema } from 'mongoose';

export interface ILearningResource {
    title: string;
    url: string;
    type: 'course' | 'project' | 'certification';
}

export interface ISkill extends Document {
    name: string;
    category: string;
    demandScore: number;
    relatedSkills: string[];
    learningResources: ILearningResource[];
}

const LearningResourceSchema = new Schema<ILearningResource>({
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['course', 'project', 'certification'], required: true },
});

const SkillSchema = new Schema<ISkill>({
    name: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true },
    demandScore: { type: Number, required: true, min: 1, max: 10 },
    relatedSkills: [{ type: String }],
    learningResources: [LearningResourceSchema],
});

export const Skill = mongoose.models.Skill || mongoose.model<ISkill>('Skill', SkillSchema);
