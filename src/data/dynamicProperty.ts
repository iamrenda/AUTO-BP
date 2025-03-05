import { world } from "@minecraft/server";
import { generalTs } from "../data/tempStorage";
import { BundlableGameID, BundleData, GameData, SubCategory } from "../models/GameID";
import { retryClearBlocks } from "../utilities/utilities";

type DefaultData = Record<BundlableGameID, Record<string, BundleData>>;

export class DynamicProperty {
  protected static dynamicData = JSON.parse(String(world.getDynamicProperty("auto:dynamicData")));

  public static postData(): void {
    const json = JSON.stringify(DynamicProperty.dynamicData);
    world.setDynamicProperty("auto:dynamicData", json);
  }

  public static fetchData(): void {
    const json = world.getDynamicProperty("auto:dynamicData");
    DynamicProperty.dynamicData = JSON.parse(String(json));
  }

  public static resetDynamicData(): void {
    const defaultData: DefaultData = {
      Bridger: {
        Straight_16_blocks: {
          pbTicks: -1,
          avgTicks: -1,
          attempts: 0,
          successAttempts: 0,
        },
        Straight_21_blocks: {
          pbTicks: -1,
          avgTicks: -1,
          attempts: 0,
          successAttempts: 0,
        },
        Straight_50_blocks: {
          pbTicks: -1,
          avgTicks: -1,
          attempts: 0,
          successAttempts: 0,
        },
        Inclined_16_blocks: {
          pbTicks: -1,
          avgTicks: -1,
          attempts: 0,
          successAttempts: 0,
        },
        Inclined_21_blocks: {
          pbTicks: -1,
          avgTicks: -1,
          attempts: 0,
          successAttempts: 0,
        },
        Inclined_50_blocks: {
          pbTicks: -1,
          avgTicks: -1,
          attempts: 0,
          successAttempts: 0,
        },
      },

      Wall_Run: {
        Ancient: {
          pbTicks: -1,
          avgTicks: -1,
          attempts: 0,
          successAttempts: 0,
        },
      },

      Bedwars_Rush: {
        Custom_Map: {
          pbTicks: -1,
          avgTicks: -1,
          attempts: 0,
          successAttempts: 0,
        },
      },

      Parkour: {
        "Chapter_1.1": {
          pbTicks: -1,
          avgTicks: -1,
          attempts: 0,
          successAttempts: 0,
        },
        "Chapter_1.2": {
          pbTicks: -1,
          avgTicks: -1,
          attempts: 0,
          successAttempts: 0,
        },
        "Chapter_1.3": {
          pbTicks: -1,
          avgTicks: -1,
          attempts: 0,
          successAttempts: 0,
        },
      },
    };
    this.dynamicData = defaultData;
    world.setDynamicProperty("auto:dynamicData", JSON.stringify(defaultData));
  }
}

export class BaseGameData extends DynamicProperty {
  public static getData<T extends BundlableGameID, K extends keyof BundleData>(
    parent: T,
    subCategory: SubCategory<T>,
    dataType: K
  ): BundleData[K] {
    return this.dynamicData[parent][subCategory][dataType];
  }

  public static setData<T extends BundlableGameID, K extends keyof BundleData>(
    parent: T,
    subCategory: SubCategory<T>,
    dataType: K,
    data: number
  ): void {
    this.dynamicData[parent][subCategory][dataType] = data;
  }

  public static addData<T extends BundlableGameID, K extends keyof BundleData>(
    parent: T,
    subCategory: SubCategory<T>,
    dataType: K
  ): void {
    this.dynamicData[parent][subCategory][dataType]++;
  }

  public static getBundledData<T extends BundlableGameID>(parent: T, subCategory: SubCategory<T>): BundleData {
    return this.dynamicData[parent][subCategory] ?? undefined;
  }
}

export class gameData {
  protected static dynamicData = JSON.parse(String(world.getDynamicProperty("auto:gameData")));

  public static postData(): void {
    const json = JSON.stringify(gameData.dynamicData);
    world.setDynamicProperty("auto:gameData", json);
  }

  public static fetchData(): void {
    const json = world.getDynamicProperty("auto:gameData");
    gameData.dynamicData = JSON.parse(String(json));
  }

  public static getData<T extends keyof GameData>(dataType: T): GameData[T] {
    return this.dynamicData[dataType];
  }

  public static setData<T extends keyof GameData>(data: T, value: GameData[T]): void {
    this.dynamicData[data] = value;
  }

  public static resetDynamicData(): void {
    const defaultData: GameData = {
      BridgerStraightDistance: 16,
      BridgerInclinedDistance: 16,
      BridgerStraightTellyMode: "None",
    };
    this.dynamicData = defaultData;
    world.setDynamicProperty("auto:gameData", JSON.stringify(defaultData));
  }
}

export class StoredBlocksClass {
  public static clearBlocks(): void {
    const jsonArray = JSON.parse(`${world.getDynamicProperty("auto:storedBlocks")}`);

    retryClearBlocks(new Set(jsonArray));
    world.setDynamicProperty("auto:storedBlocksGameID", "null");
    world.setDynamicProperty("auto:storedBlocks", "[]");
  }

  public static storeBlocks(): void {
    const { gameID, storedLocations } = generalTs.commonData;
    const json = JSON.stringify([...storedLocations]);
    world.setDynamicProperty("auto:storedBlocks", json);
    world.setDynamicProperty("auto:storedBlocksGameID", gameID);
  }
}
