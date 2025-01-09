import { BridgerTempID } from "models/DynamicProperty";
import GameID from "models/GameID";
import MinecraftID from "models/minecraftID";
type TempDataIF = {
  gameID: GameID;
  bridgerMode: BridgerTempID;
  blockBridger: MinecraftID.MinecraftBlockIdIF;
  blockClutcher: MinecraftID.MinecraftBlockIdIF;
  clutch: number[];
  clutchShiftStart: boolean;
};

//////////
const tempData: TempDataIF = {
  gameID: "lobby",
  bridgerMode: BridgerTempID.straight16blocks,
  blockBridger: "minecraft:sandstone",
  blockClutcher: "minecraft:sandstone",
  clutch: [1],
  clutchShiftStart: true,
};

export default tempData;
