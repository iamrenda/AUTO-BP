import { IslandDistance, TellyMode } from "./Bridger";

type GameID =
  | "Lobby"
  | "Bridger$Straight_16_blocks"
  | "Bridger$Straight_21_blocks"
  | "Bridger$Straight_50_blocks"
  | "Bridger$Inclined_16_blocks"
  | "Bridger$Inclined_21_blocks"
  | "Bridger$Inclined_50_blocks"
  | "Clutcher"
  | "Wall_Run$Ancient"
  | "Bedwars_Rush$Custom_Map"
  | "Fist_Reduce$Normal"
  | "Fist_Reduce$LIMITLESS"
  | "Parkour$Chapter_1.1"
  | "Parkour$Chapter_1.2"
  | "Parkour$Chapter_1.3"
  | "Parkour$Chapter_2.1"
  | "Parkour$Chapter_2.2"
  | "Wool_Parkour$Oak_1"
  | "Wool_Parkour$Oak_2"
  | "Wool_Parkour$Oak_3"
  | "Wool_Parkour$Prismarine_1"
  | "Wool_Parkour$Prismarine_2"
  | "Wool_Parkour$Prismarine_3";

export type ParentGameID =
  | "Lobby"
  | "Bridger"
  | "Clutcher"
  | "Wall_Run"
  | "Bedwars_Rush"
  | "Fist_Reduce"
  | "Parkour"
  | "Wool_Parkour";
export type BundlableGameID = Extract<
  ParentGameID,
  "Bridger" | "Wall_Run" | "Bedwars_Rush" | "Parkour" | "Wool_Parkour"
>;

export type BundleData = {
  pbTicks: number;
  avgTicks: number;
  attempts: number;
  successAttempts: number;
};

export type subCategoryGameID = {
  Bridger:
    | "Straight_16_blocks"
    | "Straight_21_blocks"
    | "Straight_50_blocks"
    | "Inclined_16_blocks"
    | "Inclined_21_blocks"
    | "Inclined_50_blocks";
  Wall_Run: "Ancient";
  Bedwars_Rush: "Custom_Map";
  Parkour: "Chapter_1.1" | "Chapter_1.2" | "Chapter_1.3" | "Chapter_2.1" | "Chapter_2.2";
  Wool_Parkour: "Oak_1" | "Oak_2" | "Oak_3" | "Prismarine_1" | "Prismarine_2" | "Prismarine_3";
};

export type SubCategory<T extends BundlableGameID> = subCategoryGameID[T];

export type GameData = {
  BridgerStraightDistance: IslandDistance;
  BridgerInclinedDistance: IslandDistance;
  BridgerStraightTellyMode: TellyMode;
};

export default GameID;
