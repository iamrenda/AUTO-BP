import { world, Vector3 } from "@minecraft/server";
import {
  DynamicPropertyID,
  BridgerTypesID,
  GameDataID,
  ParkourChapterID,
  BundlableGameModeID,
} from "../models/DynamicProperty";
import { generalTs, bridgerTs, parkourTs } from "../data/tempStorage";

/////////////////////////////////////////////////////////////////
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
    const defaultData = {
      [DynamicPropertyID.GameDatas]: {
        [GameDataID.straightDistance]: 16,
        [GameDataID.straightTellyPractice]: "None",
        [GameDataID.inclinedDistance]: 16,
      },

      [DynamicPropertyID.Bridger_PB]: {
        [BridgerTypesID.straight16blocks]: -1,
        [BridgerTypesID.straight21blocks]: -1,
        [BridgerTypesID.straight50blocks]: -1,
        [BridgerTypesID.inclined16blocks]: -1,
        [BridgerTypesID.inclined21blocks]: -1,
        [BridgerTypesID.inclined50blocks]: -1,
      },
      [DynamicPropertyID.Bridger_Attempts]: {
        [BridgerTypesID.straight16blocks]: 0,
        [BridgerTypesID.straight21blocks]: 0,
        [BridgerTypesID.straight50blocks]: 0,
        [BridgerTypesID.inclined16blocks]: 0,
        [BridgerTypesID.inclined21blocks]: 0,
        [BridgerTypesID.inclined50blocks]: 0,
      },
      [DynamicPropertyID.Bridger_SuccessAttempts]: {
        [BridgerTypesID.straight16blocks]: 0,
        [BridgerTypesID.straight21blocks]: 0,
        [BridgerTypesID.straight50blocks]: 0,
        [BridgerTypesID.inclined16blocks]: 0,
        [BridgerTypesID.inclined21blocks]: 0,
        [BridgerTypesID.inclined50blocks]: 0,
      },
      [DynamicPropertyID.Bridger_AverageTime]: {
        [BridgerTypesID.straight16blocks]: -1,
        [BridgerTypesID.straight21blocks]: -1,
        [BridgerTypesID.straight50blocks]: -1,
        [BridgerTypesID.inclined16blocks]: -1,
        [BridgerTypesID.inclined21blocks]: -1,
        [BridgerTypesID.inclined50blocks]: -1,
      },

      [DynamicPropertyID.WallRunner_PB]: -1,
      [DynamicPropertyID.WallRunner_Attempts]: 0,
      [DynamicPropertyID.WallRunner_SuccessAttempts]: 0,
      [DynamicPropertyID.WallRunner_AverageTime]: -1,

      [DynamicPropertyID.BedwarsRush_PB]: -1,
      [DynamicPropertyID.BedwarsRush_Attempts]: 0,
      [DynamicPropertyID.BedwarsRush_SuccessAttempts]: 0,
      [DynamicPropertyID.BedwarsRush_AverageTime]: -1,

      [DynamicPropertyID.Parkour_PB]: {
        [ParkourChapterID.chapter1_1]: -1,
        [ParkourChapterID.chapter1_2]: -1,
        [ParkourChapterID.chapter1_3]: -1,
      },
      [DynamicPropertyID.Parkour_Attempts]: {
        [ParkourChapterID.chapter1_1]: 0,
        [ParkourChapterID.chapter1_2]: 0,
        [ParkourChapterID.chapter1_3]: 0,
      },
      [DynamicPropertyID.Parkour_SuccessAttempts]: {
        [ParkourChapterID.chapter1_1]: 0,
        [ParkourChapterID.chapter1_2]: 0,
        [ParkourChapterID.chapter1_3]: 0,
      },
      [DynamicPropertyID.Parkour_AverageTime]: {
        [ParkourChapterID.chapter1_1]: -1,
        [ParkourChapterID.chapter1_2]: -1,
        [ParkourChapterID.chapter1_3]: -1,
      },
    };
    this.dynamicData = defaultData;
    world.setDynamicProperty("auto:dynamicData", JSON.stringify(defaultData));
  }
}

export abstract class BaseGameData extends DynamicProperty {
  public static getData(id: DynamicPropertyID): number {
    return this.dynamicData[id];
  }

  public static setData(id: DynamicPropertyID, data: number): void {
    this.dynamicData[id] = data;
  }

  public static addData(id: DynamicPropertyID): void {
    this.dynamicData[id]++;
  }

  /**
   * returns an object containing pb, avgTime, attempts, and success attempts
   */
  public static getBundledData(gameId: BundlableGameModeID): {
    pb: number;
    avgTime: number;
    attempts: number;
    successAttempts: number;
  } {
    let bundledData = {
      pb: -1,
      avgTime: -1,
      attempts: 0,
      successAttempts: 0,
    };

    Object.keys(this.dynamicData).forEach((dynamicPropertyID) => {
      if (!dynamicPropertyID.startsWith(gameId)) return;

      switch (dynamicPropertyID) {
        case `${gameId}_PB`:
          bundledData.pb = this.getData(<DynamicPropertyID>`${gameId}_PB`);
          break;
        case `${gameId}_Attempts`:
          bundledData.attempts = this.getData(<DynamicPropertyID>`${gameId}_Attempts`);
          break;
        case `${gameId}_SuccessAttempts`:
          bundledData.successAttempts = this.getData(<DynamicPropertyID>`${gameId}_SuccessAttempts`);
          break;
        case `${gameId}_AverageTime`:
          bundledData.avgTime = this.getData(<DynamicPropertyID>`${gameId}_AverageTime`);
          break;
      }
    });

    return bundledData;
  }
}

export class GameData extends DynamicProperty {
  public static getData(gameDataType: "Distance" | "TellyPractice") {
    const direction = bridgerTs.tempData["bridgerDirection"];
    return this.dynamicData[DynamicPropertyID.GameDatas][`${direction}${gameDataType}`];
  }

  public static setData(gameDataType: "Distance" | "TellyPractice", data: boolean | number | string): void {
    const direction = bridgerTs.tempData["bridgerDirection"];
    this.dynamicData[DynamicPropertyID.GameDatas][`${direction}${gameDataType}`] = data;
  }
}

export class BridgerData extends BaseGameData {
  public static getData(id: DynamicPropertyID): number {
    return this.dynamicData[id][bridgerTs.tempData["bridgerMode"]];
  }

  public static setData(id: DynamicPropertyID, data: number): void {
    this.dynamicData[id][bridgerTs.tempData["bridgerMode"]] = data;
  }

  public static addData(id: DynamicPropertyID): void {
    this.dynamicData[id][bridgerTs.tempData["bridgerMode"]]++;
  }
}

export class WallRunData extends BaseGameData {}

export class BedwarsRushData extends BaseGameData {}

export class ParkourData extends BaseGameData {
  public static getData(id: DynamicPropertyID): number {
    return this.dynamicData[id][parkourTs.tempData["chapter"]];
  }

  public static setData(id: DynamicPropertyID, data: number): void {
    this.dynamicData[id][parkourTs.tempData["chapter"]] = data;
  }

  public static addData(id: DynamicPropertyID): void {
    this.dynamicData[id][parkourTs.tempData["chapter"]]++;
  }
}

export class StoredBlocksClass {
  public static clearBlocks(): void {
    const jsonArray = JSON.parse(`${world.getDynamicProperty("auto:storedBlocks")}`);

    jsonArray.map((location: Vector3) => world.getDimension("overworld").setBlockType(location, "minecraft:air"));
    world.setDynamicProperty("auto:storedBlocksGameID", "undefined");
    world.setDynamicProperty("auto:storedBlocks", "[]");
    generalTs.commonData["storedLocationsGameID"] = undefined;
  }

  public static storeBlocks(): void {
    const json = JSON.stringify([...generalTs.commonData["storedLocations"]]);
    const gameId = generalTs.commonData["gameID"];
    world.setDynamicProperty("auto:storedBlocks", json);
    world.setDynamicProperty("auto:storedBlocksGameID", gameId);
  }
}
