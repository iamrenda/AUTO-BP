import { world } from "@minecraft/server";
import { DynamicPropertyID, BridgerTicksID, GameDataID } from "../models/DynamicProperty";
import ts from "./tempStorage";

type IslandDistance = 16 | 21 | 50;

type DynamicBridgerDataType = {
  [DynamicPropertyID.GameDatas]: boolean | IslandDistance;
  [DynamicPropertyID.PB]: number;
  [DynamicPropertyID.Attempts]: number;
  [DynamicPropertyID.SuccessAttempts]: number;
  [DynamicPropertyID.AverageTime]: number;
};

class dynamicProperty {
  private static instance: dynamicProperty;
  private constructor() {}

  public static getInstance(): dynamicProperty {
    if (!dynamicProperty.instance) dynamicProperty.instance = new dynamicProperty();
    return dynamicProperty.instance;
  }

  private dynamicData = {
    [DynamicPropertyID.GameDatas]: {
      [GameDataID.straightIsStairCased]: undefined,
      [GameDataID.straightDistance]: undefined,
      [GameDataID.inclinedIsStairCased]: undefined,
      [GameDataID.inclinedDistance]: undefined,
    },
    [DynamicPropertyID.PB]: {
      [BridgerTicksID.straight16blocks]: undefined,
      [BridgerTicksID.straight21blocks]: undefined,
      [BridgerTicksID.straight50blocks]: undefined,
      [BridgerTicksID.inclined16blocks]: undefined,
      [BridgerTicksID.inclined21blocks]: undefined,
      [BridgerTicksID.inclined50blocks]: undefined,
    },
    [DynamicPropertyID.Attempts]: {
      [BridgerTicksID.straight16blocks]: undefined,
      [BridgerTicksID.straight21blocks]: undefined,
      [BridgerTicksID.straight50blocks]: undefined,
      [BridgerTicksID.inclined16blocks]: undefined,
      [BridgerTicksID.inclined21blocks]: undefined,
      [BridgerTicksID.inclined50blocks]: undefined,
    },
    [DynamicPropertyID.SuccessAttempts]: {
      [BridgerTicksID.straight16blocks]: undefined,
      [BridgerTicksID.straight21blocks]: undefined,
      [BridgerTicksID.straight50blocks]: undefined,
      [BridgerTicksID.inclined16blocks]: undefined,
      [BridgerTicksID.inclined21blocks]: undefined,
      [BridgerTicksID.inclined50blocks]: undefined,
    },
    [DynamicPropertyID.AverageTime]: {
      [BridgerTicksID.straight16blocks]: undefined,
      [BridgerTicksID.straight21blocks]: undefined,
      [BridgerTicksID.straight50blocks]: undefined,
      [BridgerTicksID.inclined16blocks]: undefined,
      [BridgerTicksID.inclined21blocks]: undefined,
      [BridgerTicksID.inclined50blocks]: undefined,
    },
  };

  public postData() {
    const json = JSON.stringify(this.dynamicData);
    world.setDynamicProperty("auto:dynamicData", json);
  }

  public fetchData() {
    const json = JSON.parse(String(world.getDynamicProperty("auto:dynamicData")));
    this.dynamicData = json;
  }

  public getDynamicBridgerData<T extends DynamicPropertyID>(
    id: T,
    gameDataType?: "Distance" | "IsStairCased"
  ): DynamicBridgerDataType[T] {
    return id === DynamicPropertyID.GameDatas
      ? this.dynamicData[id][`${ts.getData("bridgerDirection")}${gameDataType}`]
      : +this.dynamicData[id][ts.getData("bridgerMode")];
  }

  public addDynamicBridgerData(id: DynamicPropertyID) {
    this.dynamicData[id][ts.getData("bridgerMode")]++;
  }

  public setDynamicBridgerData<T extends DynamicPropertyID>(
    id: T,
    data: DynamicBridgerDataType[T],
    gameDataType?: "Distance" | "IsStairCased"
  ) {
    if (id === DynamicPropertyID.GameDatas) {
      this.dynamicData[id][`${ts.getData("bridgerDirection")}${gameDataType}`] = data;
    } else {
      this.dynamicData[id][ts.getData("bridgerMode")] = data;
    }
  }

  public resetDynamicBridgerData(id: DynamicPropertyID) {
    this.dynamicData[id][ts.getData("bridgerMode")] = -1;
  }

  public resetDynamicData(): void {
    const defaultData = {
      [DynamicPropertyID.GameDatas]: {
        [GameDataID.straightIsStairCased]: false,
        [GameDataID.straightDistance]: 16,
        [GameDataID.inclinedIsStairCased]: false,
        [GameDataID.inclinedDistance]: 16,
      },
      [DynamicPropertyID.PB]: {
        [BridgerTicksID.straight16blocks]: -1,
        [BridgerTicksID.straight21blocks]: -1,
        [BridgerTicksID.straight50blocks]: -1,
        [BridgerTicksID.inclined16blocks]: -1,
        [BridgerTicksID.inclined21blocks]: -1,
        [BridgerTicksID.inclined50blocks]: -1,
      },
      [DynamicPropertyID.Attempts]: {
        [BridgerTicksID.straight16blocks]: 0,
        [BridgerTicksID.straight21blocks]: 0,
        [BridgerTicksID.straight50blocks]: 0,
        [BridgerTicksID.inclined16blocks]: 0,
        [BridgerTicksID.inclined21blocks]: 0,
        [BridgerTicksID.inclined50blocks]: 0,
      },
      [DynamicPropertyID.SuccessAttempts]: {
        [BridgerTicksID.straight16blocks]: 0,
        [BridgerTicksID.straight21blocks]: 0,
        [BridgerTicksID.straight50blocks]: 0,
        [BridgerTicksID.inclined16blocks]: 0,
        [BridgerTicksID.inclined21blocks]: 0,
        [BridgerTicksID.inclined50blocks]: 0,
      },
      [DynamicPropertyID.AverageTime]: {
        [BridgerTicksID.straight16blocks]: -1,
        [BridgerTicksID.straight21blocks]: -1,
        [BridgerTicksID.straight50blocks]: -1,
        [BridgerTicksID.inclined16blocks]: -1,
        [BridgerTicksID.inclined21blocks]: -1,
        [BridgerTicksID.inclined50blocks]: -1,
      },
    };
    this.dynamicData = defaultData;
    world.setDynamicProperty("auto:dynamicData", JSON.stringify(defaultData));
  }
}

const DynamicProperty = dynamicProperty.getInstance();
export default DynamicProperty;
