import { createClient } from "redis";

// Retrieve connection parameters from environment variables
const redisUsername = process.env.REDIS_USERNAME || 'default';
const redisPassword = process.env.REDIS_PASSWORD || '';
const redisHost = process.env.REDIS_HOST || 'redis-19945.c253.us-central1-1.gce.cloud.redislabs.com';
const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 19945;

const redisClient = createClient({
    username: redisUsername,
    password: redisPassword,
    socket: {
        host: redisHost,
        port: redisPort
    }
});

redisClient.on("error", (err) => {
    console.warn("⚠️ Redis Client Error (non-critical):", err.message);
});

redisClient.on("connect", () => {
    console.log(`✅ Redis connected successfully to ${redisHost}:${redisPort}`);
});

redisClient.on("ready", () => {
    console.log("✅ Redis client is ready for operations");
});

redisClient.on("reconnecting", () => {
    console.log("🔄 Redis client reconnecting...");
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