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

class tempStorage {
  private static instance: tempStorage;
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

  public static getInstance(): tempStorage {
    if (!tempStorage.instance) tempStorage.instance = new tempStorage();
    return tempStorage.instance;
  }

  public getData<T extends keyof TempDataIF>(dataType: T): TempDataIF[T] {
    return this.data[dataType];
  }

  public setData<K extends keyof TempDataIF>(key: K, value: TempDataIF[K]): void {
    this.data[key] = value;
  }
}

const TempStorage = tempStorage.getInstance();
export default TempStorage;
