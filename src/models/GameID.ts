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
  | "Parkour$Chapter_1.3";

export type ParentGameID = "Lobby" | "Bridger" | "Clutcher" | "Wall_Run" | "Bedwars_Rush" | "Fist_Reduce" | "Parkour";
export type BundlableGameID = Extract<ParentGameID, "Bridger" | "Wall_Run" | "Bedwars_Rush" | "Parkour">;

export type BundleData = {
  pbTicks: number;
  avgTicks: number;
  attempts: number;
  successAttempts: number;
};

type subCategoryGameID = {
  Bridger:
    | "Straight_16_blocks"
    | "Straight_21_blocks"
    | "Straight_50_blocks"
    | "Inclined_16_blocks"
    | "Inclined_21_blocks"
    | "Inclined_50_blocks";
  Wall_Run: "Ancient";
  Bedwars_Rush: "Custom_Map";
  Parkour: "Chapter_1.1" | "Chapter_1.2" | "Chapter_1.3";
};

export type SubCategory<T extends BundlableGameID> = subCategoryGameID[T];

export default GameID;
