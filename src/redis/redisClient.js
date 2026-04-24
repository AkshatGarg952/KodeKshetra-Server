import { createClient } from "redis";

let redisClient = null;
let isRedisConnected = false;
let lastRedisError = null;

const getRedisUrl = () => process.env.REDIS_URL || "redis://localhost:6379";

const maskRedisUrl = (value) => {
  try {
    const parsed = new URL(value);
    if (parsed.password) {
      parsed.password = "****";
    }
    return parsed.toString();
  } catch {
    return value;
  }
};

const logRedis = (message) => {
  console.log(`[Redis] ${message}`);
};

const warnRedis = (message) => {
  console.warn(`[Redis] ${message}`);
};

const errorRedis = (message) => {
  console.error(`[Redis] ${message}`);
};

const initializeRedis = async () => {
  try {
    const redisUrl = getRedisUrl();
    logRedis(`Connecting to ${maskRedisUrl(redisUrl)}...`);

    const client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            warnRedis("Connection failed after 3 retries. Running without Redis.");
            return false;
          }
          warnRedis(`Reconnect attempt ${retries} scheduled...`);
          return Math.min(retries * 100, 3000);
        }
      }
    });

    client.on("error", (err) => {
      lastRedisError = err?.message || "Unknown Redis client error";
      errorRedis(`Client error: ${lastRedisError}`);
      isRedisConnected = false;
    });

    client.on("connect", () => {
      logRedis("Socket connected.");
    });

    client.on("ready", () => {
      isRedisConnected = true;
      lastRedisError = null;
      logRedis("Client ready. Redis is connected and commands can be used.");
    });

    client.on("disconnect", () => {
      isRedisConnected = false;
      warnRedis("Socket disconnected.");
    });

    client.on("reconnecting", () => {
      isRedisConnected = false;
      warnRedis("Trying to reconnect...");
    });

    client.on("end", () => {
      isRedisConnected = false;
      warnRedis("Connection closed.");
    });

    await client.connect();
    const pingResponse = await client.ping();
    logRedis(`PING response: ${pingResponse}`);
    redisClient = client;
    return client;
  } catch (error) {
    lastRedisError = error?.message || "Unknown Redis connection error";
    errorRedis(`Failed to connect: ${lastRedisError}`);
    warnRedis("Application will continue without Redis. Matchmaking and leaderboard features may be limited.");
    return null;
  }
};

await initializeRedis();

export const getRedisClient = () => redisClient;
export const isRedisAvailable = () => isRedisConnected && redisClient !== null;
export const getRedisStatus = () => ({
  connected: isRedisAvailable(),
  hasClient: redisClient !== null,
  lastError: lastRedisError
});
export const getRedisHealth = async () => {
  const baseStatus = getRedisStatus();

  if (!baseStatus.connected || !redisClient) {
    return {
      status: 'unavailable',
      ...baseStatus,
      ping: null
    };
  }

  try {
    const ping = await redisClient.ping();
    return {
      status: ping === 'PONG' ? 'ok' : 'degraded',
      ...baseStatus,
      ping
    };
  } catch (error) {
    lastRedisError = error?.message || 'Unknown Redis ping error';
    return {
      status: 'error',
      connected: false,
      hasClient: redisClient !== null,
      lastError: lastRedisError,
      ping: null
    };
  }
};
export default redisClient;
