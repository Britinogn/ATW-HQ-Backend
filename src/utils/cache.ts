import redisClient from '../config/redisClient'; // Adjust path to your Redis client
import { CacheOptions } from '../types';

// Generic caching utility with type safety
export const cache = {
    // Get cached value (returns null if miss or error)
    get: async <T>(key: string): Promise<T | null> => {
        try {
            const value = await redisClient.get(key);
            return value ? JSON.parse(value) as T : null;
        } catch (error: any) {
            console.warn('Cache get error:', error.message);
            return null;
        }
    },

    // Set value with optional TTL
    set: async <T>(key: string, value: T, options?: CacheOptions): Promise<boolean> => {
        try {
            const ttl = options?.ttl || 300; // Default 5 minutes
            await redisClient.set(key, JSON.stringify(value), { EX: ttl });
            return true;
        } catch (error: any) {
            console.warn('Cache set error:', error.message);
            return false;
        }
    },

    // Delete key
    del: async (key: string): Promise<boolean> => {
        try {
            await redisClient.del(key);
            return true;
        } catch (error: any) {
            console.warn('Cache delete error:', error.message);
            return false;
        }
    }
};