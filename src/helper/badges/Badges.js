import User from "../../models/user.model.js";

const badgesEarned = async(player)=>{
   const user = await User.findById(player.id);

}

export default badgesEarned;