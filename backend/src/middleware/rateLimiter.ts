import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../db/redis';

// For 10,000 users, memory store is insufficient as it doesn't sync across clustered workers.
// We strictly require Redis in production-like environments.
const isProduction = process.env.NODE_ENV === 'production';

if (!redisClient && isProduction) {
    console.error("❌ CRITICAL ERROR: REDIS_URI is required for rate limiting in production clustering.");
    process.exit(1);
}

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per 15 mins
    standardHeaders: true,
    legacyHeaders: false,
    store: redisClient
        ? new RedisStore({
            sendCommand: async (...args: string[]) => {
                const client = redisClient!;
                return client.call(args[0], ...args.slice(1)) as any;
            },
        })
        : undefined, // Memory store fallback only for dev
    message: {
        status: 429,
        message: "High traffic detected. Please try again after 15 minutes."
    }
});

// A stricter limit specifically for AI Generation Endpoints
export const aiEndpointLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 AI Generations per hour
    standardHeaders: true,
    legacyHeaders: false,
    store: redisClient
        ? new RedisStore({
            sendCommand: async (...args: string[]) => {
                const client = redisClient!;
                return client.call(args[0], ...args.slice(1)) as any;
            },
        })
        : undefined,
    message: {
        status: 429,
        message: "AI quota exceeded for this hour. Scalability protection in effect."
    }
});
