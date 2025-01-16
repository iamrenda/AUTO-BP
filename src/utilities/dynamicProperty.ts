import { world } from "@minecraft/server";
import { DynamicPropertyID, BridgerTicksID, GameDataID } from "../models/DynamicProperty";
import ts from "./tempStorage";

/////////////////////////////////////////////////////////////////
class DynamicProperty {
  protected static dynamicData = JSON.parse(String(world.getDynamicProperty("auto:dynamicData")));

  public static postData(): void {
    const json = JSON.stringify(this.dynamicData);
    world.sendMessage(json);
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
    };
    this.dynamicData = defaultData;
    world.setDynamicProperty("auto:dynamicData", JSON.stringify(defaultData));
  }
}

class GameData extends DynamicProperty {
  public static getData(gameDataType: "IsStairCased" | "Distance") {
    const direction = ts.getData("bridgerDirection");
    return this.dynamicData[DynamicPropertyID.GameDatas][`${direction}${gameDataType}`];
  }

  public static setData(gameDataType: "IsStairCased" | "Distance", data: boolean | number): void {
    const direction = ts.getData("bridgerDirection");
    this.dynamicData[DynamicPropertyID.GameDatas][`${direction}${gameDataType}`] = data;
  }
}

class BridgerData extends DynamicProperty {
  public static getData(id: DynamicPropertyID): number {
    return this.dynamicData[id][ts.getData("bridgerMode")];
  }

  public static setData(id: DynamicPropertyID, data: number): void {
    this.dynamicData[id][ts.getData("bridgerMode")] = data;
  }

  public static addData(id: DynamicPropertyID): void {
    this.dynamicData[id][ts.getData("bridgerMode")]++;
  }
}

class WallRunData extends DynamicProperty {
  public static getData(id: DynamicPropertyID): number {
    return this.dynamicData[id];
  }

  public static setData(id: DynamicPropertyID, data: number): void {
    this.dynamicData[id] = data;
  }
}

export { DynamicProperty, GameData, BridgerData, WallRunData };
