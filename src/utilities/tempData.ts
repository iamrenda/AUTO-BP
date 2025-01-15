import { Player } from "@minecraft/server";
import { BridgerTicksID } from "../models/DynamicProperty";
import GameID from "../models/GameID";
import MinecraftID from "../models/minecraftID";

type TempDataIF = {
  player: Player;
  gameID: GameID;
  bridgerMode: BridgerTicksID;
  bridgerDirection: "straight" | "inclined";
  blockBridger: MinecraftID.MinecraftBlockIdIF;
  blockClutcher: MinecraftID.MinecraftBlockIdIF;
  clutch: number[];
  clutchShiftStart: boolean;
};

//////////
const tempData: TempDataIF = {
  player: undefined,
  gameID: "lobby",
  bridgerMode: BridgerTicksID.straight16blocks,
  bridgerDirection: "straight",
  blockBridger: "minecraft:sandstone",
  blockClutcher: "minecraft:sandstone",
  clutch: [1],
  clutchShiftStart: true,
};

export default tempData;
