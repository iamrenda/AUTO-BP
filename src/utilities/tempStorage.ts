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

class tempData {
  private static instance: tempData;
  private constructor() {}
  private data: TempDataIF = {
    player: undefined,
    gameID: "lobby",

    bridgerMode: BridgerTicksID.straight16blocks,
    bridgerDirection: "straight",
    blockBridger: "minecraft:sandstone",

    clutcherBlock: "minecraft:sandstone",
    clutchHits: [1],
    clutchShiftStart: true,
  };

  public static getInstance(): tempData {
    if (!tempData.instance) tempData.instance = new tempData();
    return tempData.instance;
  }

  public getData<T extends keyof TempDataIF>(dataType: T): TempDataIF[T] {
    return this.data[dataType];
  }

  public setData<K extends keyof TempDataIF>(key: K, value: TempDataIF[K]): void {
    this.data[key] = value;
  }
}

const TempData = tempData.getInstance();
export default TempData;
