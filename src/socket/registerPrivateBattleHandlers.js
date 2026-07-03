export default function registerPrivateBattleHandlers(socket, {
  Battle,
  BATTLE_DURATION_SECONDS,
  User,
  battleState,
  calculateXP,
  claimBattleProcessing,
  clearBattleProcessingState,
  decideWinner,
  emitToUser,
  getBattleSubmissions,
  getQuestionForBattle,
  getTotalTestCount,
  isRedisAvailable,
  joinPrivateRoom,
  leavePrivateRoom,
  markProblemSolvedOnce,
  applyBattleOutcomeForUser,
  processingBattles,
  recordBattleSubmission,
  refreshLeaderboardEntries,
  sanitizeQuestionForClient,
  buildBattleStartPayload,
  setPrivateRoomConfig,
}) {
  const { battleRooms, battleSubmissions, battles } = battleState;

  const emitResolvedBattleResult = (userId, battle) => {
    const result = battle.resolutionStatus
      || (battle.winner
        ? (battle.winner.toString() === userId ? "won" : "loss")
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
      roomId: battle.roomId || null,
    });

    emitToUser(userId, "battleResult", {
      result,
      reason: "Battle already finalized.",
      battleId: battle._id,
      battleContext,
      battleResultDetails: battle.resolutionPayload || null,
      battleEndedAt: battle.resolvedAt?.toISOString?.() || null,
    });
  };

  socket.on("leaveBattleRoom", ({ roomId }) => {
    const authenticatedUserId = socket.data.userId;
    if (!roomId || !battleRooms.has(roomId)) {
      void leavePrivateRoom({ roomId, userId: authenticatedUserId }).catch(() => null);
      socket.data.joinedRoomIds?.delete(roomId);
      return;
    }

    socket.leave(roomId);
    const joinedUsers = battleRooms.get(roomId);
    joinedUsers.delete(authenticatedUserId);
    void leavePrivateRoom({ roomId, userId: authenticatedUserId }).catch(() => null);
    socket.data.joinedRoomIds?.delete(roomId);

    if (joinedUsers.size === 0) {
      battleRooms.delete(roomId);
      battles.delete(roomId);
    } else {
      for (const otherUserId of joinedUsers) {
        emitToUser(otherUserId, "opponentDisconnected", {
          roomId,
          userId: authenticatedUserId,
        });
      }
    }
  });

  socket.on("joinBattleRoom", async ({ battle, roomId }) => {
    try {
      const authenticatedUserId = socket.data.userId;
      if (!authenticatedUserId || !roomId) {
        socket.emit("battleJoinError", {
          message: "Missing room details. Please try joining again.",
        });
        return;
      }

      const redisRoomState = await joinPrivateRoom({
        roomId,
        userId: authenticatedUserId,
        battleConfig: battle,
      }).catch(() => null);

      const existingRoomUsers = battleRooms.get(roomId);
      const roomParticipants = redisRoomState?.members || [...(existingRoomUsers || [])];
      const isExistingParticipant = roomParticipants.includes(authenticatedUserId);

      if (roomParticipants.length > 2 || (roomParticipants.length === 2 && !isExistingParticipant)) {
        socket.emit("battleJoinError", {
          message: "Room is full. Cannot join the battle.",
        });
        await leavePrivateRoom({ roomId, userId: authenticatedUserId }).catch(() => null);
        return;
      }

      socket.join(roomId);
      socket.data.joinedRoomIds?.add(roomId);

      if (!battleRooms.has(roomId)) {
        battleRooms.set(roomId, new Set());
      }

      battleRooms.get(roomId).add(authenticatedUserId);

      const roomBattleConfig = redisRoomState?.config || battles.get(roomId) || battle || null;
      if (roomBattleConfig?.mode && roomBattleConfig?.topic) {
        battles.set(roomId, roomBattleConfig);
      }

      if (roomBattleConfig?.battleId) {
        const existingBattle = await Battle.findById(roomBattleConfig.battleId).lean();
        if (existingBattle) {
          if (existingBattle.resolvedAt) {
            emitResolvedBattleResult(authenticatedUserId, existingBattle);
            return;
          }

          const existingPayload = buildBattleStartPayload({
            question: sanitizeQuestionForClient(existingBattle.question, roomBattleConfig.mode),
            battleId: existingBattle._id,
            mode: existingBattle.mode,
            topic: existingBattle.topic,
            battleType: existingBattle.battleType,
            battleStartedAt: existingBattle.battleStartedAt?.toISOString?.() || roomBattleConfig.battleStartedAt || null,
            battleEndsAt: existingBattle.battleEndsAt ?? roomBattleConfig.battleEndsAt ?? null,
            battleDurationSeconds: BATTLE_DURATION_SECONDS,
            roomId,
          });

          emitToUser(authenticatedUserId, "battleStart", existingPayload);
          return;
        }
      }

      const joinedUsers = redisRoomState?.members || [...battleRooms.get(roomId)];
      if (joinedUsers.length !== 2) {
        return;
      }

      const roomBattle = battles.get(roomId);
      if (!roomBattle?.mode || !roomBattle?.topic) {
        joinedUsers.forEach((participantId) => {
          emitToUser(participantId, "battleJoinError", {
            message: "This room does not have a battle configuration yet. Ask the host to recreate it.",
          });
        });
        battleRooms.delete(roomId);
        battles.delete(roomId);
        await Promise.all(
          joinedUsers.map((participantId) =>
            leavePrivateRoom({ roomId, userId: participantId }).catch(() => null),
          ),
        );
        return;
      }

      const userIds = [...joinedUsers];
      const users = await User.find({ _id: { $in: userIds } })
        .select("_id rating solvedQuestions")
        .lean();

      if (users.length !== 2) {
        userIds.forEach((participantId) => {
          emitToUser(participantId, "battleJoinError", {
            message: "Could not load both players for this room.",
          });
        });
        battleRooms.delete(roomId);
        battles.delete(roomId);
        await Promise.all(
          userIds.map((participantId) =>
            leavePrivateRoom({ roomId, userId: participantId }).catch(() => null),
          ),
        );
        return;
      }

      const usersById = new Map(users.map((user) => [user._id.toString(), user]));
      const user1 = usersById.get(userIds[0]);
      const user2 = usersById.get(userIds[1]);

      if (!user1 || !user2) {
        userIds.forEach((participantId) => {
          emitToUser(participantId, "battleJoinError", {
            message: "Could not load both players for this room.",
          });
        });
        battleRooms.delete(roomId);
        battles.delete(roomId);
        await Promise.all(
          userIds.map((participantId) =>
            leavePrivateRoom({ roomId, userId: participantId }).catch(() => null),
          ),
        );
        return;
      }

      const existingBattle = await Battle.findOne({ roomId, battleType: "private" }).sort({ createdAt: -1 }).lean();
      if (existingBattle) {
        if (existingBattle.resolvedAt) {
          userIds.forEach((participantId) => {
            emitResolvedBattleResult(participantId, existingBattle);
          });
          return;
        }

        const existingPayload = buildBattleStartPayload({
          question: sanitizeQuestionForClient(existingBattle.question, roomBattle.mode),
          battleId: existingBattle._id,
          mode: existingBattle.mode,
          topic: existingBattle.topic,
          battleType: existingBattle.battleType,
          battleStartedAt: existingBattle.battleStartedAt?.toISOString?.() || null,
          battleEndsAt: existingBattle.battleEndsAt ?? null,
          battleDurationSeconds: BATTLE_DURATION_SECONDS,
          roomId,
        });

        userIds.forEach((participantId) => {
          emitToUser(participantId, "battleStart", existingPayload);
        });
        return;
      }

      const question = await getQuestionForBattle(roomBattle, user1, user2);
      const battleStartedAt = new Date();
      const battleEndsAt = battleStartedAt.getTime() + (BATTLE_DURATION_SECONDS * 1000);
      const newBattle = await Battle.create({
        player1: user1._id,
        player2: user2._id,
        roomId,
        battleType: "private",
        question,
        mode: roomBattle.mode,
        topic: roomBattle.topic,
        createdAt: battleStartedAt,
        battleStartedAt,
        battleEndsAt,
      });

      const startedRoomConfig = {
        ...roomBattle,
        battleId: newBattle._id.toString(),
        battleStartedAt: battleStartedAt.toISOString(),
        battleEndsAt,
      };
      battles.set(roomId, startedRoomConfig);
      await setPrivateRoomConfig?.({ roomId, battleConfig: startedRoomConfig });

      const payload = buildBattleStartPayload({
        question: sanitizeQuestionForClient(question, roomBattle.mode),
        battleId: newBattle._id,
        mode: roomBattle.mode,
        topic: roomBattle.topic,
        battleType: "private",
        battleStartedAt: battleStartedAt.toISOString(),
        battleEndsAt,
        battleDurationSeconds: BATTLE_DURATION_SECONDS,
        roomId,
      });

      userIds.forEach((participantId) => {
        emitToUser(participantId, "battleStart", payload);
      });
    } catch (error) {
      console.error("Error in joinBattleRoom:", error);
      socket.emit("battleJoinError", {
        message: "Unable to join the battle room right now.",
      });
    }
  });

  socket.on("battleEnded", async ({ battleDetails, code, roomId, lost }) => {
    const authenticatedUserId = socket.data.userId;
    if (!battleDetails?.battleId || !authenticatedUserId) {
      return;
    }

    const user = await User.findById(authenticatedUserId).select("currWinStreak").lean();
    if (!user) {
      return;
    }

    const currentPlayer = {
      id: authenticatedUserId,
      code: code || "",
      time: battleDetails.timeRemaining ?? 0,
      currWinStreak: user.currWinStreak,
      language: battleDetails.language || null,
    };

    if (lost) {
      currentPlayer.status = "loss";
    }

    let submissionMap = null;
    if (isRedisAvailable()) {
      const submissionCount = await recordBattleSubmission({
        battleId: battleDetails.battleId,
        userId: authenticatedUserId,
        payload: currentPlayer,
      });

      if ((submissionCount || 0) < 2) {
        return;
      }

      const shouldProcess = await claimBattleProcessing(battleDetails.battleId);
      if (!shouldProcess) {
        return;
      }

      submissionMap = await getBattleSubmissions(battleDetails.battleId);
      if (!submissionMap || submissionMap.size < 2) {
        await clearBattleProcessingState(battleDetails.battleId);
        return;
      }
    } else if (battleSubmissions.has(battleDetails.battleId)) {
      if (processingBattles.has(battleDetails.battleId)) {
        return;
      }

      processingBattles.add(battleDetails.battleId);
      const firstSubmission = battleSubmissions.get(battleDetails.battleId);
      submissionMap = new Map([
        [firstSubmission.id, firstSubmission],
        [authenticatedUserId, currentPlayer],
      ]);
    } else {
      battleSubmissions.set(battleDetails.battleId, currentPlayer);
      return;
    }

    let finalizedParticipantIds = [];
    try {
      const battle = await Battle.findById(battleDetails.battleId);
      if (!battle) {
        throw new Error("Cannot find any battle!");
      }

        if (battle.resolvedAt) {
          const existingStatus = battle.winner
            ? (battle.winner.toString() === authenticatedUserId ? "won" : "loss")
            : "draw";
          emitToUser(authenticatedUserId, "battleResult", {
            result: existingStatus,
            reason: "Battle already finalized.",
            battleId: battle._id,
            battleContext: buildBattleStartPayload({
              question: sanitizeQuestionForClient(battle.question, battle.mode),
              battleId: battle._id,
              mode: battle.mode,
              topic: battle.topic,
              battleType: battle.battleType,
              battleStartedAt: battle.battleStartedAt?.toISOString?.() || null,
              battleEndsAt: battle.battleEndsAt ?? null,
              battleDurationSeconds: BATTLE_DURATION_SECONDS,
              roomId: battle.roomId || null,
            }),
            battleResultDetails: battle.resolutionPayload || null,
            battleEndedAt: battle.resolvedAt?.toISOString?.() || null,
          });
          return;
        }

      const question = battle.question;
      const player1Id = battle.player1?.toString();
      const player2Id = battle.player2?.toString();
      const player1 = submissionMap.get(player1Id);
      const player2 = submissionMap.get(player2Id);

      if (!player1 || !player2) {
        throw new Error("Cannot find both battle submissions!");
      }

      finalizedParticipantIds = [player1.id, player2.id];

      const preStatus = player1.status || player2.status;
      if (preStatus) {
        if (preStatus === "won") {
          player1.status = player1.status || "won";
          player2.status = player2.status || "loss";
        } else if (preStatus === "loss") {
          player1.status = player1.status || "loss";
          player2.status = player2.status || "won";
        } else {
          player1.status = player1.status || "draw";
          player2.status = player2.status || "draw";
        }
      }

      if (!player1.status && !player2.status) {
        const [player1PassedCases, player2PassedCases] = await Promise.all([
          decideWinner(player1.code, player1.language, question),
          decideWinner(player2.code, player2.language, question),
        ]);

        player1.passedCases = player1PassedCases;
        player2.passedCases = player2PassedCases;

        if (player1PassedCases > player2PassedCases) {
          player1.status = "won";
          player2.status = "loss";
        } else if (player1PassedCases < player2PassedCases) {
          player1.status = "loss";
          player2.status = "won";
        } else if (player1.time > player2.time) {
          player1.status = "won";
          player2.status = "loss";
        } else if (player1.time < player2.time) {
          player1.status = "loss";
          player2.status = "won";
        } else {
          battle.winner = null;
          player1.status = "draw";
          player2.status = "draw";
        }
      }

      if (player1.status === "won") {
        battle.winner = player1.id;
      } else if (player2.status === "won") {
        battle.winner = player2.id;
      } else {
        battle.winner = null;
      }

      battle.resolutionStatus = player1.status === "won"
        ? "won"
        : player2.status === "won"
          ? "loss"
          : "draw";
      battle.resolutionPayload = {
        player1: {
          id: player1.id,
          status: player1.status,
          passedCases: player1.passedCases ?? 0,
          time: player1.time ?? 0,
          xp: player1.xp ?? 0,
        },
        player2: {
          id: player2.id,
          status: player2.status,
          passedCases: player2.passedCases ?? 0,
          time: player2.time ?? 0,
          xp: player2.xp ?? 0,
        },
      };
      battle.resolvedAt = new Date();

      await battle.save();

      player1.xp = calculateXP(player1);
      player2.xp = calculateXP(player2);

      await Promise.all([
        applyBattleOutcomeForUser(player1),
        applyBattleOutcomeForUser(player2),
      ]);

      const totalTests = getTotalTestCount(question);
      const solvedPlatform = battle.mode === "cp" ? "Codeforces" : "LeetCode";

      await Promise.all([
        player1.passedCases === totalTests && totalTests > 0
          ? markProblemSolvedOnce({
            userId: player1.id,
            platform: solvedPlatform,
            problemId: question.problemId,
            tags: question.tags || [],
          })
          : Promise.resolve(),
        player2.passedCases === totalTests && totalTests > 0
          ? markProblemSolvedOnce({
            userId: player2.id,
            platform: solvedPlatform,
            problemId: question.problemId,
            tags: question.tags || [],
          })
          : Promise.resolve(),
      ]);

      const battleContext = buildBattleStartPayload({
        question: sanitizeQuestionForClient(battle.question, battle.mode),
        battleId: battle._id,
        mode: battle.mode,
        topic: battle.topic,
        battleType: battle.battleType,
        battleStartedAt: battle.battleStartedAt?.toISOString?.() || null,
        battleEndsAt: battle.battleEndsAt ?? null,
        battleDurationSeconds: BATTLE_DURATION_SECONDS,
        roomId: battle.roomId || null,
      });

      await refreshLeaderboardEntries([player1.id, player2.id]);
      emitToUser(player1.id, "battleResult", {
        result: player1.status,
        reason: "Battle finished.",
        battleId: battle._id,
        battleContext,
        battleResultDetails: battle.resolutionPayload || null,
        battleEndedAt: battle.resolvedAt?.toISOString?.() || null,
      });
      emitToUser(player2.id, "battleResult", {
        result: player2.status,
        reason: "Battle finished.",
        battleId: battle._id,
        battleContext,
        battleResultDetails: battle.resolutionPayload || null,
        battleEndedAt: battle.resolvedAt?.toISOString?.() || null,
      });
    } catch (error) {
      console.error(error.message);
    } finally {
      if (isRedisAvailable()) {
        await clearBattleProcessingState(battleDetails.battleId).catch(() => null);
      } else {
        battleSubmissions.delete(battleDetails.battleId);
        processingBattles.delete(battleDetails.battleId);
      }

      if (roomId) {
        battleRooms.delete(roomId);
        battles.delete(roomId);
        socket.data.joinedRoomIds?.delete(roomId);
        await Promise.all(
          finalizedParticipantIds.map((participantId) =>
            leavePrivateRoom({ roomId, userId: participantId }).catch(() => null),
          ),
        );
      }
    }
  });
}
