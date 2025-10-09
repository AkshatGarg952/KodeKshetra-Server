const XPCalculator = (player)=>{
  let xp = 0;
  const status = player.status;
    if(status == true){
    return xp;
  }
  
  else{
  if(status==="won"){
    xp+=10;
    if(player.time<=600){
        xp+=3;
    }

    if(player.currWinStreak>=3){
        xp+=3;
    }
  }
  else{
    xp-=2;
  }

}
  return xp;

  
}

export default XPCalculator