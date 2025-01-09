export enum DynamicPropertyID {
  GameDatas = "auto:gameDatas",
  PB = "auto:pb",
  Attempts = "auto:atmps",
  SuccessAttempts = "auto:successAtmps",
}

// only for setter / getter dynamic property purposes
export enum BridgerTempID {
  straight16blocks = "straight16b",
  straight21blocks = "straight21b",
  straight50blocks = "straight50b",
  incline16blocks = "inclined16b",
  incline25blocks = "inclined21b",
  incline50blocks = "inclined50b",
}

export enum GameDataID {
  straightIsStairCased = "straightIsStairCased",
  straightDistance = "straightDistance",
  inclinedIsStairCased = "inclinedIsStairCased",
  inclinedDistance = "inclinedDistance",
}
