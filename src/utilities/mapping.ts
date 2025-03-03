import { BaseGameData, BedwarsRushData, BridgerData, ParkourData, WallRunData } from "../data/dynamicProperty";
import { BundlableGameModeID } from "../models/DynamicProperty";
import GameID from "../models/GameID";

interface GameInfo {
  name: string;
  bundlableID?: BundlableGameModeID;
  baseData?: typeof BaseGameData;
}

export const gameInfoMapping: Record<GameID, GameInfo> = {
  lobby: { name: "Lobby" },
  straightBridger: { name: "Bridger Straight", bundlableID: "Bridger", baseData: BridgerData },
  inclinedBridger: { name: "Bridger Inclined", bundlableID: "Bridger", baseData: BridgerData },
  clutcher: { name: "Clutcher" },
  wallRun: { name: "Wall Run", bundlableID: "WallRunner", baseData: WallRunData },
  bedwarsRush: { name: "Bedwars Rush", bundlableID: "BedwarsRush", baseData: BedwarsRushData },
  normalFistReduce: { name: "Fist Reduce Normal" },
  limitlessFistReduce: { name: "Fist Reduce LIMITLESS" },
  parkour1_1: { name: "Parkour 1.1", bundlableID: "Parkour", baseData: ParkourData },
  parkour1_2: { name: "Parkour 1.2", bundlableID: "Parkour", baseData: ParkourData },
  parkour1_3: { name: "Parkour 1.3", bundlableID: "Parkour", baseData: ParkourData },
};

export const getGameInfo = function (gameId: GameID): GameInfo {
  return gameInfoMapping[gameId] ?? { name: "Unknown Game" };
};
