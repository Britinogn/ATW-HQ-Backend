import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err)
});

redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
});


export const connectRedis = async () =>{
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
        process.exit(1);
    }
}

export default redisClient;
