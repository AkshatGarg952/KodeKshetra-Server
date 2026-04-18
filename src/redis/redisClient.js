import { createClient } from "redis";

let redisClient = null;
let isRedisConnected = false;

const initializeRedis = async () => {
  try {
    const client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.warn("Redis connection failed after 3 retries. Running without Redis.");
            return false;
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    client.on("error", (err) => {
      console.error("Redis Client Error:", err.message);
      isRedisConnected = false;
    });

    client.on("connect", () => {
      isRedisConnected = true;
    });

    client.on("disconnect", () => {
      isRedisConnected = false;
    });

    await client.connect();
    redisClient = client;
    return client;
  } catch (error) {
    console.error("Failed to connect to Redis:", error.message);
    console.warn("Application will continue without Redis. Matchmaking and leaderboard features may be limited.");
    return null;
  }
};

await initializeRedis();

export const getRedisClient = () => redisClient;
export const isRedisAvailable = () => isRedisConnected && redisClient !== null;
export default redisClient;
