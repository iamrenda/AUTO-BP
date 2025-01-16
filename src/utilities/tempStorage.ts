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
  clutcherBlock: MinecraftID.MinecraftBlockIdIF;
  clutchHits: number[];
  clutchShiftStart: boolean;
};

class TempStorage {
  private static data: TempDataIF = {
    player: null,
    gameID: "lobby",

    bridgerMode: BridgerTicksID.straight16blocks,
    bridgerDirection: "straight",
    blockBridger: "minecraft:sandstone",

    clutcherBlock: "minecraft:sandstone",
    clutchHits: [1],
    clutchShiftStart: true,
  };

  public static getData<T extends keyof TempDataIF>(dataType: T): TempDataIF[T] {
    return TempStorage.data[dataType];
  }

  public static setData<K extends keyof TempDataIF>(key: K, value: TempDataIF[K]): void {
    TempStorage.data[key] = value;
  }
}

export default TempStorage;
