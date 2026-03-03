import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../db/redis';

// Default options if Redis is unavailable
const fallbackStore = undefined;

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    store: redisClient
        ? new RedisStore({
            sendCommand: async (...args: string[]) => {
                const client = redisClient!;
                return client.call(args[0], ...args.slice(1)) as any;
            },
        })
        : fallbackStore, // Use memory store if Redis is offline
    message: {
        status: 429,
        message: "Too many requests from this IP, please try again after 15 minutes."
    }
});

// A stricter limit specifically for AI Generation Endpoints
export const aiEndpointLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 AI Generations per hour to control API costs
    standardHeaders: true,
    legacyHeaders: false,
    store: redisClient
        ? new RedisStore({
            sendCommand: async (...args: string[]) => {
                const client = redisClient!;
                return client.call(args[0], ...args.slice(1)) as any;
            },
        })
        : fallbackStore,
    message: {
        status: 429,
        message: "You have exhausted your AI Generation quota for the hour. Please wait."
    }
});
