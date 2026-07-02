const XPCalculator = (player) => {
  let xp = 0;
  const status = player.status;

  if (status === "won") {
    xp += 10;
    if (player.time <= 600) {
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