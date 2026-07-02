export function createUserEventBus({
  getRedisClient,
  io,
  isRedisAvailable,
  serverInstanceId,
  userEventChannel,
}) {
  const onlineUsers = new Map();

  const addOnlineSocket = (userId, socketId) => {
    if (!userId) {
      return;
    }

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId).add(socketId);
  };

  const removeOnlineSocket = (userId, socketId) => {
    const socketIds = onlineUsers.get(userId);
    if (!socketIds) {
      return;
    }

    socketIds.delete(socketId);
    if (socketIds.size === 0) {
      onlineUsers.delete(userId);
    }
  };

  const emitToUserLocally = (userId, event, payload) => {
    const socketIds = onlineUsers.get(userId);
    if (!socketIds || socketIds.size === 0) {
      return;
    }

    for (const socketId of socketIds) {
      io.to(socketId).emit(event, payload);
    }
  };

  const publishUserEvent = async (userId, event, payload) => {
    if (!isRedisAvailable()) {
      return;
    }

    try {
      const redisClient = getRedisClient();
      await redisClient.publish(
        userEventChannel,
        JSON.stringify({
          userId,
          event,
          payload,
          sourceInstanceId: serverInstanceId,
        }),
      );
    } catch (error) {
      console.warn(`Failed to publish user event ${event} for ${userId}: ${error.message}`);
    }
  };

  const emitToUser = (userId, event, payload) => {
    emitToUserLocally(userId, event, payload);
    void publishUserEvent(userId, event, payload);
  };

  const initializeUserEventSubscriber = async () => {
    if (!isRedisAvailable()) {
      return;
    }

    try {
      const subscriber = getRedisClient().duplicate();
      await subscriber.connect();
      await subscriber.subscribe(userEventChannel, (message) => {
        try {
          const parsed = JSON.parse(message);
          if (!parsed?.userId || !parsed?.event || parsed.sourceInstanceId === serverInstanceId) {
            return;
          }

          emitToUserLocally(parsed.userId, parsed.event, parsed.payload);
        } catch (error) {
          console.warn(`Failed to process Redis user event: ${error.message}`);
        }
      });
    } catch (error) {
      console.warn(`Failed to initialize Redis user event subscriber: ${error.message}`);
    }
  };

  return {
    addOnlineSocket,
    emitToUser,
    initializeUserEventSubscriber,
    onlineUsers,
    removeOnlineSocket,
  };
}

