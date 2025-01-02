export enum DynamicPropertyID {
  GameID = "auto:gameId",
  GameDatas = "auto:gameDatas",
  PB = "auto:pb",
  Attemps = "auto:atmps",
  SuccessAttempts = "auto:successAtmps",
}

export enum GameID {
  lobby = "lobby",
  straightBridger = "straightBridger",
  clutcher = "clutcher",
}

// only for setter / getter dynamic property purposes
export enum DynamicGame {
  straight16blocks = "straight16b",
  straight21blocks = "straight21b",
  straight50blocks = "straight50b",
  // incline16blocks = "incline16b",
  // incline25blocks = "incline25b",
  // incline50blocks = "incline50b",
}

export enum GameDataID {
  straightIsStairCased = "straightIsStairCased",
  straightDistance = "straightDistance",
}
