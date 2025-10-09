import { createClient } from "redis";

// Connect to local Redis running in Docker
const redisClient = createClient({
  url: "redis://red-d3jqe6ffte5s7380jmpg:6379" // Docker port mapping
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

await redisClient.connect();

console.log("Connected to Redis successfully");

export default redisClient;
