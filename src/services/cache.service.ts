import redisClient from "../config/redisClient";
import { CacheOptions } from "../types";

export class CacheService {
    
    async get<T> (key: string): Promise <T | null> {
        try {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data): null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }


    async set(key:string, value:any, options?: CacheOptions):Promise<void> {
        try {
            const stringValue = JSON.stringify(value);
            if (options?.ttl) {
                await redisClient.setEx(key, options.ttl, stringValue)
            } else{
                await redisClient.set(key, stringValue)
            }
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }


    async delete(key: string): Promise<void> {
        try {
            await redisClient.del(key);
        } catch (error) {
            console.error('Cache delete error:', error);
        }
    }

    async clear(pattern: string): Promise<void> {
        try {
            const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
        } catch (error) {
            console.error('Cache clear error:', error);
        }
    }


}

export default new CacheService();