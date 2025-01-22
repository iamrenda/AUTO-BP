export enum DynamicPropertyID {
  GameDatas = "gameDatas",

  Bridger_PB = "Bridger_PB",
  Bridger_Attempts = "Bridger_Attempts",
  Bridger_SuccessAttempts = "Bridger_SuccessAttempts",
  Bridger_AverageTime = "Bridger_AverageTime",

  WallRunner_PB = "WallRunner_PB",
  WallRunner_Attempts = "WallRunner_Attempts",
  WallRunner_SuccessAttempts = "WallRunner_SuccessAttempts",
  WallRunner_AverageTime = "WallRunner_AverageTime",

  bedwarsRush_PB = "bedwarsRush_PB",
  bedwarsRush_Attempts = "bedwarsRush_Attempts",
  bedwarsRush_SuccessAttempts = "bedwarsRush_SuccessAttempts",
  bedwarsRush_AverageTime = "bedwarsRush_AverageTime",
}

export enum BridgerTicksID {
  straight16blocks = "straight16b",
  straight21blocks = "straight21b",
  straight50blocks = "straight50b",
  inclined16blocks = "inclined16b",
  inclined21blocks = "inclined21b",
  inclined50blocks = "inclined50b",
}

export enum GameDataID {
  straightIsStairCased = "straightIsStairCased",
  straightDistance = "straightDistance",
  inclinedIsStairCased = "inclinedIsStairCased",
  inclinedDistance = "inclinedDistance",
  straightTellyPractice = "straightTellyPractice", // "None", "Telly", "Speed Telly"
}
