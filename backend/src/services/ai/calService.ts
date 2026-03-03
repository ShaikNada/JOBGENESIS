import { TrainingData } from "../../models/TrainingData.model";

export async function processMissionForCAL(mission: any) {
    try {
        const { role, score, rank, skillTags, telemetry, progression } = mission;

        // Anonymize and calculate metrics
        const tabSwitches = telemetry?.tabSwitches || 0;
        const totalKeystrokes = telemetry?.totalKeystrokes || 0;
        const pasteCount = telemetry?.pasteEvents || 0;

        // Calculate typing stability (simple variance proxy)
        const intervals = telemetry?.typingIntervals || [];
        let stability = 0;
        if (intervals.length > 2) {
            const mean = intervals.reduce((a: number, b: number) => a + b, 0) / intervals.length;
            const variance = intervals.reduce((a: number, b: number) => a + Math.pow(b - mean, 2), 0) / intervals.length;
            stability = Math.sqrt(variance);
        }

        // Save anonymized record
        await TrainingData.create({
            role,
            skillTags,
            score,
            finalRank: rank,
            telemetryMetrics: {
                tabSwitchRatio: tabSwitches,
                typingStability: stability,
                pasteCount: pasteCount
            }
        });

        console.log(`[CAL] Successfully anonymized and logged training data for ${role} mission.`);
    } catch (err) {
        console.error("[CAL] Failed to process mission for feedback loop:", err);
    }
}
