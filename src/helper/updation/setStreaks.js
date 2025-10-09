import { set } from "mongoose";
import User from "../../models/user.model.js";

const setStreaks = async(player)=>{
 const user = await User.findById(player.id);
 const battleResult = player.status;

 if (battleResult === "won") {
    user.currWinStreak += 1;
    if (user.currWinStreak > user.maxWinStreak) {
      user.maxWinStreak = user.currWinStreak;
    }
  } else {
    user.currWinStreak = 0;
  }

  await user.save();
  updateDailyStreaks(player)

}


async function updateDailyStreaks(player) {
  const user = await User.findById(player.id);

  const today = new Date();
  const todayDate = new Date(today.setHours(0, 0, 0, 0));
  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);

  const playedYesterday = user.totalB.some(b => {
    const battleDate = new Date(b.date);
    battleDate.setHours(0, 0, 0, 0);
    return battleDate.getTime() === yesterdayDate.getTime();
  });

    const playedToday = user.totalB.some(b => {
    const battleDate = new Date(b.date);
    battleDate.setHours(0, 0, 0, 0);
    return battleDate.getTime() === todayDate.getTime();
  });

  if (playedToday) {
    return;
  }
  
  if (playedYesterday) {
    user.currStreak += 1;
  } else {
    user.currStreak = 1;
  }

  if (user.currStreak > user.maxStreak) {
    user.maxStreak = user.currStreak;
  }


  await user.save();
}

export default setStreaks

