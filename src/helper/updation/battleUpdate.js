import User from "../../models/user.model.js";

const battleUpdate = async (player) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  try {
    const battleResult = player.status;
    const updateQuery = {};

    if (battleResult === "won") {
      const user = await User.findById(player.id);
      if (!user) return;

      const hasWonToday = user.totalW.some(entry => entry.date >= startOfDay);
      const hasBattlesToday = user.totalB.some(entry => entry.date >= startOfDay);

      if (hasWonToday) {
        updateQuery.$inc = {
          "totalW.$[wonElem].battlesWon": 1
        };
      } else {
        updateQuery.$push = {
          totalW: { date: new Date(), battlesWon: 1 }
        };
      }

      if (hasBattlesToday) {
        updateQuery.$inc = {
          ...updateQuery.$inc,
          "totalB.$[battleElem].battlesPlayed": 1
        };
      } else {
        updateQuery.$push = {
          ...updateQuery.$push,
          totalB: { date: new Date(), battlesPlayed: 1 }
        };
      }

      const arrayFilters = [];
      if (hasWonToday) {
        arrayFilters.push({ "wonElem.date": { $gte: startOfDay } });
      }
      if (hasBattlesToday) {
        arrayFilters.push({ "battleElem.date": { $gte: startOfDay } });
      }

      await User.findByIdAndUpdate(
        player.id,
        updateQuery,
        {
          arrayFilters: arrayFilters.length > 0 ? arrayFilters : undefined,
          new: true
        }
      );

    } else if (battleResult === "draw") {
      const user = await User.findById(player.id);
      if (!user) return;

      const hasDrawToday = user.totalD.some(entry => entry.date >= startOfDay);
      const hasBattlesToday = user.totalB.some(entry => entry.date >= startOfDay);

      if (hasDrawToday) {
        updateQuery.$inc = {
          "totalD.$[drawElem].battlesDraw": 1
        };
      } else {
        updateQuery.$push = {
          totalD: { date: new Date(), battlesDraw: 1 }
        };
      }

      if (hasBattlesToday) {
        updateQuery.$inc = {
          ...updateQuery.$inc,
          "totalB.$[battleElem].battlesPlayed": 1
        };
      } else {
        updateQuery.$push = {
          ...updateQuery.$push,
          totalB: { date: new Date(), battlesPlayed: 1 }
        };
      }

      const arrayFilters = [];
      if (hasDrawToday) {
        arrayFilters.push({ "drawElem.date": { $gte: startOfDay } });
      }
      if (hasBattlesToday) {
        arrayFilters.push({ "battleElem.date": { $gte: startOfDay } });
      }

      await User.findByIdAndUpdate(
        player.id,
        updateQuery,
        {
          arrayFilters: arrayFilters.length > 0 ? arrayFilters : undefined,
          new: true
        }
      );

    } else if (battleResult === "loss") {
      const user = await User.findById(player.id);
      if (!user) return;

      const hasBattlesToday = user.totalB.some(entry => entry.date >= startOfDay);

      if (hasBattlesToday) {
        await User.findByIdAndUpdate(
          player.id,
          {
            $inc: { "totalB.$[battleElem].battlesPlayed": 1 }
          },
          {
            arrayFilters: [{ "battleElem.date": { $gte: startOfDay } }],
            new: true
          }
        );
      } else {
        await User.findByIdAndUpdate(
          player.id,
          {
            $push: { totalB: { date: new Date(), battlesPlayed: 1 } }
          },
          { new: true }
        );
      }
    }
  } catch (error) {
    console.error("Error updating battle stats:", error);
  }
};

export default battleUpdate;
