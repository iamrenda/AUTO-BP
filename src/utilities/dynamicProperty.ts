import { world } from "@minecraft/server";
import { DynamicPropertyID, BridgerTicksID, GameDataID } from "../models/DynamicProperty";
import ts from "./tempStorage";

/////////////////////////////////////////////////////////////////
class DynamicPropertyClass {
  private static instance: DynamicPropertyClass;

  protected constructor() {}

  public static getInstance(): DynamicPropertyClass {
    if (!DynamicPropertyClass.instance) DynamicPropertyClass.instance = new DynamicPropertyClass();
    return DynamicPropertyClass.instance;
  }

  protected dynamicData = {
    [DynamicPropertyID.GameDatas]: {
      [GameDataID.straightIsStairCased]: undefined,
      [GameDataID.straightDistance]: undefined,
      [GameDataID.inclinedIsStairCased]: undefined,
      [GameDataID.inclinedDistance]: undefined,
    },
    [DynamicPropertyID.Bridger_PB]: {
      [BridgerTicksID.straight16blocks]: undefined,
      [BridgerTicksID.straight21blocks]: undefined,
      [BridgerTicksID.straight50blocks]: undefined,
      [BridgerTicksID.inclined16blocks]: undefined,
      [BridgerTicksID.inclined21blocks]: undefined,
      [BridgerTicksID.inclined50blocks]: undefined,
    },
    [DynamicPropertyID.Bridger_Attempts]: {
      [BridgerTicksID.straight16blocks]: undefined,
      [BridgerTicksID.straight21blocks]: undefined,
      [BridgerTicksID.straight50blocks]: undefined,
      [BridgerTicksID.inclined16blocks]: undefined,
      [BridgerTicksID.inclined21blocks]: undefined,
      [BridgerTicksID.inclined50blocks]: undefined,
    },
    [DynamicPropertyID.Bridger_SuccessAttempts]: {
      [BridgerTicksID.straight16blocks]: undefined,
      [BridgerTicksID.straight21blocks]: undefined,
      [BridgerTicksID.straight50blocks]: undefined,
      [BridgerTicksID.inclined16blocks]: undefined,
      [BridgerTicksID.inclined21blocks]: undefined,
      [BridgerTicksID.inclined50blocks]: undefined,
    },
    [DynamicPropertyID.Bridger_AverageTime]: {
      [BridgerTicksID.straight16blocks]: undefined,
      [BridgerTicksID.straight21blocks]: undefined,
      [BridgerTicksID.straight50blocks]: undefined,
      [BridgerTicksID.inclined16blocks]: undefined,
      [BridgerTicksID.inclined21blocks]: undefined,
      [BridgerTicksID.inclined50blocks]: undefined,
    },
    [DynamicPropertyID.WallRunner_PB]: undefined,
    [DynamicPropertyID.WallRunner_Attempts]: undefined,
    [DynamicPropertyID.WallRunner_SuccessAttempts]: undefined,
    [DynamicPropertyID.WallRunner_AverageTime]: undefined,
  };

  public postData(): void {
    const json = JSON.stringify(this.dynamicData);
    world.setDynamicProperty("auto:dynamicData", json);
  }

  public fetchData(): void {
    const json = JSON.parse(String(world.getDynamicProperty("auto:dynamicData")));
    this.dynamicData = json;
  }

  public resetDynamicData(): void {
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

class GameDataClass extends DynamicPropertyClass {
  private constructor() {
    super();
  }

  public static getInstance() {
    return DynamicPropertyClass.getInstance() as GameDataClass;
  }

  public getData(gameDataType: "IsStairCased" | "Distance") {
    const direction = ts.getData("bridgerDirection");
    return this.dynamicData[DynamicPropertyID.GameDatas][`${direction}${gameDataType}`];
  }

  public setData(gameDataType: "IsStairCased" | "Distance", data: boolean | number): void {
    const direction = ts.getData("bridgerDirection");
    this.dynamicData[DynamicPropertyID.GameDatas][`${direction}${gameDataType}`] = data;
  }
}

class BridgerDataClass extends DynamicPropertyClass {
  private constructor() {
    super();
  }

  public static getInstance() {
    return DynamicPropertyClass.getInstance() as BridgerDataClass;
  }

  public getData(id: DynamicPropertyID): number {
    return this.dynamicData[id][ts.getData("bridgerMode")];
  }

  public setData(id: DynamicPropertyID, data: number): void {
    this.dynamicData[id][ts.getData("bridgerMode")] = data;
  }

  public addData(id: DynamicPropertyID): void {
    this.dynamicData[id][ts.getData("bridgerMode")]++;
  }
}

class WallRunDataClass extends DynamicPropertyClass {
  private constructor() {
    super();
  }

  public static getInstance() {
    return DynamicPropertyClass.getInstance() as WallRunDataClass;
  }

  public getData(id: DynamicPropertyID): number {
    return this.dynamicData[id];
  }

  public setData(id: DynamicPropertyID, data: number): void {
    this.dynamicData[id] = data;
  }
}

const DynamicProperty = DynamicPropertyClass.getInstance();
const GameData = GameDataClass.getInstance();
const BridgerData = BridgerDataClass.getInstance();
const WallRunData = WallRunDataClass.getInstance();

export { DynamicProperty, GameData, BridgerData, WallRunData };
