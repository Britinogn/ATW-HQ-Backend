import { createClient } from "redis";

// Use environment variables or Docker service name
const redisHost = process.env.REDIS_HOST || "redis";
const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
const redisUrl = process.env.REDIS_URL || `redis://${redisHost}:${redisPort}`;

const redisClient = createClient({
    url: redisUrl
});

redisClient.on("error", (err) => {
    console.warn("⚠️ Redis Client Error (non-critical):", err.message);
});

redisClient.on("connect", () => {
    console.log(`✅ Redis connected successfully to ${redisUrl}`);
});

export const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log("✅ Redis connection established");
    } catch (err) {
        console.warn("⚠️ Redis unavailable - continuing without cache");
        console.warn("   Error:", err);
    }
};

export default redisClient;
