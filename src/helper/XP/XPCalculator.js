const BATTLE_DURATION_SECONDS = Number(process.env.BATTLE_DURATION_SECONDS || 1800);

const XPCalculator = (player) => {
  let xp = 0;
  const status = player.status;

  if (status === "won") {
    xp += 10;
    // player.time is seconds *remaining* at submission time, not elapsed —
    // reward players who finished within the first 10 minutes (high time left).
    if (player.time >= BATTLE_DURATION_SECONDS - 600) {
      xp += 3;
    }
    if (player.currWinStreak >= 3) {
      xp += 3;
    }
  } else if (status === "draw") {
    xp = 0;
  } else if (status === "loss") {
    xp = -2;
  }

  return xp;
};

export default XPCalculator