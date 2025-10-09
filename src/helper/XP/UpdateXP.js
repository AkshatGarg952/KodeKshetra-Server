import User from "../../models/user.model.js";

const updateXP = async (player) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));

  const user = await User.findById(player.id);

  if (!user) return;

  // Check if today’s XP entry exists
  const todayEntryIndex = user.XP.findIndex(entry => entry.date >= startOfDay);

  if (todayEntryIndex !== -1) {
    // Update existing entry
    await User.updateOne(
      { _id: player.id, [`XP.${todayEntryIndex}.date`]: user.XP[todayEntryIndex].date },
      { $inc: { [`XP.${todayEntryIndex}.xp`]: player.xp } }
    );
  } else {
    // Add a new XP entry
    await User.findByIdAndUpdate(
      player.id,
      { $push: { XP: { xp: player.xp, date: new Date() } } }
    );
  }
};

export default updateXP;
