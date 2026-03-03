import Redis from 'ioredis';

const REDIS_URI = process.env.REDIS_URI;

let redisClient: Redis | null = null;
const memoryCache = new Map<string, { value: any, expiresAt: number | null }>();

if (REDIS_URI) {
    redisClient = new Redis(REDIS_URI);
    redisClient.on('connect', () => console.log('🟢 Redis Connected successfully'));
    redisClient.on('error', (err) => console.error('🔴 Redis Connection Error:', err));
} else {
    console.warn('⚠️ WARNING: REDIS_URI not found. Using local in-memory fallback. This is not suitable for scale.');
}

/**
 * Set a value in the cache. 
 * @param key Cache key
 * @param value Data payload (objects will be JSON.stringified)
 * @param ttlSeconds Optional expiration time in seconds
 */
export const cacheSet = async (key: string, value: any, ttlSeconds?: number): Promise<void> => {
    if (redisClient) {
        const payload = JSON.stringify(value);
        if (ttlSeconds) {
            await redisClient.set(key, payload, 'EX', ttlSeconds);
        } else {
            await redisClient.set(key, payload);
        }
    } else {
        memoryCache.set(key, {
            value,
            expiresAt: ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null
        });
    }
};

/**
 * Retrieve a value from the cache
 */
export const cacheGet = async <T = any>(key: string): Promise<T | null> => {
    if (redisClient) {
        const data = await redisClient.get(key);
        if (!data) return null;
        try {
            return JSON.parse(data) as T;
        } catch {
            return data as any;
        }
    } else {
        const item = memoryCache.get(key);
        if (!item) return null;
        if (item.expiresAt && Date.now() > item.expiresAt) {
            memoryCache.delete(key);
            return null;
        }
        return item.value as T;
    }
};

/**
 * Delete a value from the cache
 */
export const cacheDelete = async (key: string): Promise<void> => {
    if (redisClient) {
        await redisClient.del(key);
    } else {
        memoryCache.delete(key);
    }
};

export default redisClient;
