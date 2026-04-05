import { Queue, Worker, Job } from 'bullmq';
import { Problem } from "../../models/Problem.model";
import IORedis from 'ioredis';
import { runJavaScript } from './jsRunner';

const REDIS_URI = process.env.REDIS_URI || process.env.REDIS_URL;
let connection: IORedis | null = null;
let codeQueue: Queue | null = null;

if (REDIS_URI && REDIS_URI !== 'false') {
    try {
        const isTLS = REDIS_URI.startsWith('rediss://');
        connection = new IORedis(REDIS_URI, {
            maxRetriesPerRequest: null,
            connectTimeout: 5000,
            tls: isTLS ? {} : undefined,
            retryStrategy: (times) => {
                if (times > 3) return null; // try 3 times then give up
                return 2000;
            }
        });

        connection.on('error', (err) => {
            if (err.message.includes('ECONNRESET')) return;
            console.warn('⚠️ BullMQ Redis Connection Warning:', err.message);
        });

        codeQueue = new Queue('code-execution', { connection: connection as any });
    } catch (err) {
        console.error('🔴 Failed to initialize BullMQ:', err);
    }
} else {
    console.warn('⚠️ WARNING: REDIS_URI not found for BullMQ. Queue system will be disabled.');
}

export { codeQueue };

// Define the worker separately if needed for scalability
export const setupWorker = () => {
    if (!connection) return null;

    const worker = new Worker('code-execution', async (job: Job) => {
        const { code, testCases, functionName } = job.data;
        console.log(`[Worker] Executing job ${job.id} for ${functionName}`);

        // Execute in isolated-vm
        const result = await runJavaScript(code, testCases, functionName);
        return result;
    }, { connection: connection as any });

    return worker;
};
