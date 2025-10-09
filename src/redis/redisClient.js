import { createClient } from "redis";

// Connect to local Redis running in Docker
const redisClient = createClient({
  url: "redis://localhost:6379" // Docker port mapping
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

await redisClient.connect();

console.log("Connected to Redis successfully");

export default redisClient;
