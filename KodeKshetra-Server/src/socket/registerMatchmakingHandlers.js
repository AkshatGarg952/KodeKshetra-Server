export default function registerMatchmakingHandlers(socket, {
  SERVER_INSTANCE_ID,
  Battle,
  User,
  addUserToQueue,
  cancelMatchmaking,
  buildBattleStartPayload,
  BATTLE_DURATION_SECONDS,
  getRedisStatus,
  sanitizeQuestionForClient,
  tryToMatch,
  onlineUsers,
  io,
}) {
  socket.on("resumeBattleState", async ({ battleId = null, roomId = null, queuedServerNow = null } = {}) => {
    try {
      const authenticatedUserId = socket.data.userId;
      if (!authenticatedUserId) {
        return;
      }

      let battle = null;
      if (battleId) {
        battle = await Battle.findById(battleId).lean();
      } else if (roomId) {
        battle = await Battle.findOne({
          roomId,
          $or: [{ player1: authenticatedUserId }, { player2: authenticatedUserId }],
        })
          .sort({ createdAt: -1 })
          .lean();
      } else if (Number.isFinite(Number(queuedServerNow)) && Number(queuedServerNow) > 0) {
        battle = await Battle.findOne({
          $or: [{ player1: authenticatedUserId }, { player2: authenticatedUserId }],
          createdAt: { $gte: new Date(Number(queuedServerNow)) },
        })
          .sort({ createdAt: -1 })
          .lean();
      } else {
        return;
      }

      if (!battle) {
        return;
      }

      const participantIds = [battle.player1?.toString?.(), battle.player2?.toString?.()].filter(Boolean);
      if (!participantIds.includes(authenticatedUserId)) {
        return;
      }

      if (battle.resolvedAt) {
        const result = battle.resolutionStatus
          || (battle.winner
            ? (battle.winner.toString() === authenticatedUserId ? "won" : "loss")
            : "draw");

        const battleContext = buildBattleStartPayload({
          question: sanitizeQuestionForClient(battle.question, battle.mode),
          battleId: battle._id,
          mode: battle.mode,
          topic: battle.topic,
          battleType: battle.battleType,
          battleStartedAt: battle.battleStartedAt?.toISOString?.() || null,
          battleEndsAt: battle.battleEndsAt ?? null,
          battleDurationSeconds: BATTLE_DURATION_SECONDS,
          roomId: battle.roomId || roomId || null,
        });

        socket.emit("battleResult", {
          result,
          reason: "Battle already finalized.",
          battleId: battle._id,
          battleContext,
          battleResultDetails: battle.resolutionPayload || null,
          battleEndedAt: battle.resolvedAt?.toISOString?.() || null,
        });
        return;
      }

      const payload = buildBattleStartPayload({
        question: sanitizeQuestionForClient(battle.question, battle.mode),
        battleId: battle._id,
        mode: battle.mode,
        topic: battle.topic,
        battleType: battle.battleType,
        battleStartedAt: battle.battleStartedAt?.toISOString?.() || null,
        battleEndsAt: battle.battleEndsAt ?? null,
        battleDurationSeconds: BATTLE_DURATION_SECONDS,
        roomId: battle.roomId || roomId || null,
      });

      socket.emit("battleStart", payload);
    } catch (error) {
      console.error("Resume battle state error:", error.message);
    }
  });

  socket.on("cancelMatchmaking", async ({ mode, topic }) => {
    try {
      const authenticatedUserId = socket.data.userId;
      const user = await User.findById(authenticatedUserId).select("_id").lean();

      if (!user) {
        socket.emit("cancelMatchmakingResponse", {
          success: false,
          message: "Cannot find the user!",
        });
        return;
      }

      const success = await cancelMatchmaking({ userId: authenticatedUserId, mode, topic });
      socket.emit("cancelMatchmakingResponse", {
        success,
        message: success
          ? "Matchmaking cancelled successfully."
          : "Could not cancel matchmaking (maybe not in queue).",
      });
    } catch (error) {
      console.error("Cancel matchmaking error:", error.message);
      socket.emit("cancelMatchmakingResponse", {
        success: false,
        message: "Server error while cancelling matchmaking.",
      });
    }
  });

  socket.on("joinQueue", async ({ mode, topic }) => {
    try {
      const authenticatedUserId = socket.data.userId;
      const redisStatusAtJoin = getRedisStatus();
      console.log(
        `[Matchmaking] joinQueue requested instance=${SERVER_INSTANCE_ID} userId=${authenticatedUserId} mode=${mode} topic=${topic} redisConnected=${redisStatusAtJoin.connected} hasClient=${redisStatusAtJoin.hasClient} lastError=${redisStatusAtJoin.lastError || "none"}`,
      );

      if (!authenticatedUserId || !mode || !topic) {
        socket.emit("matchmakingError", {
          message: "Missing matchmaking details. Please choose a mode and topic again.",
        });
        return;
      }

      const user = await User.findById(authenticatedUserId).select("rating").lean();
      if (!user) {
        socket.emit("matchmakingError", {
          message: "Cannot find the user for matchmaking.",
        });
        return;
      }

      const rating = user.rating?.[mode] || 1200;
      await addUserToQueue({ userId: authenticatedUserId, mode, topic, rating });
      socket.emit("matchmakingQueued", {
        serverNow: Date.now(),
        mode,
        topic,
      });
      console.log(
        `[Matchmaking] user queued instance=${SERVER_INSTANCE_ID} userId=${authenticatedUserId} mode=${mode} topic=${topic} rating=${rating}`,
      );
      await tryToMatch(mode, topic, io, onlineUsers);
    } catch (error) {
      console.error("Error in joinQueue:", error);
      const redisStatusAtError = getRedisStatus();
      console.error(
        `[Matchmaking] joinQueue failed instance=${SERVER_INSTANCE_ID} userId=${socket.data.userId} mode=${mode} topic=${topic} redisConnected=${redisStatusAtError.connected} hasClient=${redisStatusAtError.hasClient} lastError=${redisStatusAtError.lastError || "none"}`,
      );
      socket.emit("matchmakingError", {
        message: error.message || "Unable to join matchmaking right now.",
      });
    }
  });
}
