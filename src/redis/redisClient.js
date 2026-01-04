import { createClient } from "redis";

// Connect to local Redis running in Docker
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

await redisClient.connect();

console.log("Connected to Redis successfully");

export default redisClient;
