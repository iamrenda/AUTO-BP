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

  BedwarsRush_PB = "BedwarsRush_PB",
  BedwarsRush_Attempts = "BedwarsRush_Attempts",
  BedwarsRush_SuccessAttempts = "BedwarsRush_SuccessAttempts",
  BedwarsRush_AverageTime = "BedwarsRush_AverageTime",

  Parkour_PB = "Parkour_PB",
  Parkour_Attempts = "Parkour_Attempts",
  Parkour_SuccessAttempts = "Parkour_SuccessAttempts",
  Parkour_AverageTime = "Parkour_AverageTime",
}

export enum BridgerTypesID {
  straight16blocks = "straight16blocks",
  straight21blocks = "straight21blocks",
  straight50blocks = "straight50blocks",
  inclined16blocks = "inclined16blocks",
  inclined21blocks = "inclined21blocks",
  inclined50blocks = "inclined50blocks",
}

export enum ParkourChapterID {
  chapter1_1 = "chapter1_1",
  chapter1_2 = "chapter1_2",
  chapter1_3 = "chapter1_3",
}

export enum GameDataID {
  straightDistance = "straightDistance",
  inclinedDistance = "inclinedDistance",
  straightTellyPractice = "straightTellyPractice",
}

// BUNDLED DATAS
export type BundleData = {
  pbTicks: number;
  avgTicks: number;
  attempts: number;
  successAttempts: number;
};

export type BundlableGameModeID = "Bridger" | "WallRunner" | "BedwarsRush" | "Parkour";
