import { Queue, Worker, Job } from 'bullmq';
import { Problem } from "../../models/Problem.model";
import IORedis from 'ioredis';
import { runJavaScript } from './jsRunner';

const REDIS_URI = process.env.REDIS_URI || 'redis://localhost:6379';
const connection = new IORedis(REDIS_URI, { maxRetriesPerRequest: null });

export const codeQueue = new Queue('code-execution', { connection: connection as any });

// Define the worker separately if needed for scalability
export const setupWorker = () => {
    const worker = new Worker('code-execution', async (job: Job) => {
        const { code, testCases, functionName } = job.data;
        console.log(`[Worker] Executing job ${job.id} for ${functionName}`);

        // Execute in isolated-vm
        const result = await runJavaScript(code, testCases, functionName);
        return result;
    }, { connection: connection as any });

    worker.on('completed', (job) => {
        console.log(`[Worker] Job ${job.id} completed successfully`);
    });

    worker.on('failed', (job, err) => {
        console.error(`[Worker] Job ${job?.id} failed:`, err);
    });

    return worker;
};
