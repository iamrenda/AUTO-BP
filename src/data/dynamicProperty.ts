import { world } from "@minecraft/server";
import { DynamicPropertyID, BridgerTicksID, GameDataID } from "../models/DynamicProperty";
import { bridgerTs } from "./tempStorage";

/////////////////////////////////////////////////////////////////
export class DynamicProperty {
  protected static dynamicData = JSON.parse(String(world.getDynamicProperty("auto:dynamicData")));

  public static postData(): void {
    const json = JSON.stringify(this.dynamicData);
    world.setDynamicProperty("auto:dynamicData", json);
  }

  public static fetchData(): void {
    const json = JSON.parse(String(world.getDynamicProperty("auto:dynamicData")));
    this.dynamicData = json;
  }

  public static resetDynamicData(): void {
    const defaultData = {
      [DynamicPropertyID.GameDatas]: {
        [GameDataID.straightIsStairCased]: false,
        [GameDataID.straightDistance]: 16,
        [GameDataID.straightTellyPractice]: "None",
        [GameDataID.inclinedIsStairCased]: false,
        [GameDataID.inclinedDistance]: 16,
      },

      [DynamicPropertyID.Bridger_PB]: {
        [BridgerTicksID.straight16blocks]: -1,
        [BridgerTicksID.straight21blocks]: -1,
        [BridgerTicksID.straight50blocks]: -1,
        [BridgerTicksID.inclined16blocks]: -1,
        [BridgerTicksID.inclined21blocks]: -1,
        [BridgerTicksID.inclined50blocks]: -1,
      },
      [DynamicPropertyID.Bridger_Attempts]: {
        [BridgerTicksID.straight16blocks]: 0,
        [BridgerTicksID.straight21blocks]: 0,
        [BridgerTicksID.straight50blocks]: 0,
        [BridgerTicksID.inclined16blocks]: 0,
        [BridgerTicksID.inclined21blocks]: 0,
        [BridgerTicksID.inclined50blocks]: 0,
      },
      [DynamicPropertyID.Bridger_SuccessAttempts]: {
        [BridgerTicksID.straight16blocks]: 0,
        [BridgerTicksID.straight21blocks]: 0,
        [BridgerTicksID.straight50blocks]: 0,
        [BridgerTicksID.inclined16blocks]: 0,
        [BridgerTicksID.inclined21blocks]: 0,
        [BridgerTicksID.inclined50blocks]: 0,
      },
      [DynamicPropertyID.Bridger_AverageTime]: {
        [BridgerTicksID.straight16blocks]: -1,
        [BridgerTicksID.straight21blocks]: -1,
        [BridgerTicksID.straight50blocks]: -1,
        [BridgerTicksID.inclined16blocks]: -1,
        [BridgerTicksID.inclined21blocks]: -1,
        [BridgerTicksID.inclined50blocks]: -1,
      },

      [DynamicPropertyID.WallRunner_PB]: -1,
      [DynamicPropertyID.WallRunner_Attempts]: 0,
      [DynamicPropertyID.WallRunner_SuccessAttempts]: 0,
      [DynamicPropertyID.WallRunner_AverageTime]: -1,

      [DynamicPropertyID.bedwarsRush_PB]: -1,
      [DynamicPropertyID.bedwarsRush_Attempts]: 0,
      [DynamicPropertyID.bedwarsRush_SuccessAttempts]: 0,
      [DynamicPropertyID.bedwarsRush_AverageTime]: -1,
    };
    this.dynamicData = defaultData;
    world.setDynamicProperty("auto:dynamicData", JSON.stringify(defaultData));
  }
}

export class GameData extends DynamicProperty {
  public static getData(gameDataType: "IsStairCased" | "Distance" | "TellyPractice") {
    const direction = bridgerTs.tempData["bridgerDirection"];
    return this.dynamicData[DynamicPropertyID.GameDatas][`${direction}${gameDataType}`];
  }

  public static setData(
    gameDataType: "IsStairCased" | "Distance" | "TellyPractice",
    data: boolean | number | string
  ): void {
    const direction = bridgerTs.tempData["bridgerDirection"];
    this.dynamicData[DynamicPropertyID.GameDatas][`${direction}${gameDataType}`] = data;
  }
}

export class BridgerData extends DynamicProperty {
  public static getData(id: DynamicPropertyID): number {
    return this.dynamicData[id][bridgerTs.tempData["bridgerMode"]];
  }

  public static getBundledData(): {
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
      if (!dynamicPropertyID.startsWith("WallRunner")) return;

      switch (dynamicPropertyID) {
        case "WallRunner_PB":
          bundledData.pb = this.getData(DynamicPropertyID.Bridger_PB);
          break;
        case "WallRunner_Attempts":
          bundledData.attempts = this.getData(DynamicPropertyID.Bridger_Attempts);
          break;
        case "WallRunner_SuccessAttempts":
          bundledData.successAttempts = this.getData(DynamicPropertyID.Bridger_SuccessAttempts);
          break;
        case "WallRunner_AverageTime":
          bundledData.avgTime = this.getData(DynamicPropertyID.Bridger_AverageTime);
          break;
      }
    });

    return bundledData;
  }

  public static setData(id: DynamicPropertyID, data: number): void {
    this.dynamicData[id][bridgerTs.tempData["bridgerMode"]] = data;
  }

  public static addData(id: DynamicPropertyID): void {
    this.dynamicData[id][bridgerTs.tempData["bridgerMode"]]++;
  }
}

export class WallRunData extends DynamicProperty {
  public static getData(id: DynamicPropertyID): number {
    return this.dynamicData[id];
  }

  public static getBundledData(): {
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
      switch (dynamicPropertyID) {
        case "Bridger_PB":
          bundledData.pb = this.getData(DynamicPropertyID.WallRunner_PB);
          break;
        case "Bridger_Attempts":
          bundledData.attempts = this.getData(DynamicPropertyID.WallRunner_Attempts);
          break;
        case "Bridger_SuccessAttempts":
          bundledData.successAttempts = this.getData(DynamicPropertyID.WallRunner_SuccessAttempts);
          break;
        case "Bridger_AverageTime":
          bundledData.avgTime = this.getData(DynamicPropertyID.WallRunner_AverageTime);
          break;
      }
    });

    return bundledData;
  }

  public static setData(id: DynamicPropertyID, data: number): void {
    this.dynamicData[id] = data;
  }

  public static addData(id: DynamicPropertyID): void {
    this.dynamicData[id]++;
  }
}

export class BedwarsRushData extends DynamicProperty {
  public static getData(id: DynamicPropertyID): number {
    return this.dynamicData[id];
  }

  public static getBundledData(): {
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
      switch (dynamicPropertyID) {
        case "bedwarsRush_PB":
          bundledData.pb = this.getData(DynamicPropertyID.bedwarsRush_PB);
          break;
        case "bedwarsRush_Attempts":
          bundledData.attempts = this.getData(DynamicPropertyID.bedwarsRush_Attempts);
          break;
        case "bedwarsRush_SuccessAttempts":
          bundledData.successAttempts = this.getData(DynamicPropertyID.bedwarsRush_SuccessAttempts);
          break;
        case "bedwarsRush_AverageTime":
          bundledData.avgTime = this.getData(DynamicPropertyID.bedwarsRush_AverageTime);
          break;
      }
    });

    return bundledData;
  }

  public static setData(id: DynamicPropertyID, data: number): void {
    this.dynamicData[id] = data;
  }

  public static addData(id: DynamicPropertyID): void {
    this.dynamicData[id]++;
  }
}
