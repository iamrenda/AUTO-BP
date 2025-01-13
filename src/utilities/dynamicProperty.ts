import { world } from "@minecraft/server";
import { DynamicPropertyID, BridgerTicksID, GameDataID } from "../models/DynamicProperty";
import tempData from "./tempData";

type IslandDistance = 16 | 21 | 50;

type DynamicBridgerDataType = {
  [DynamicPropertyID.GameDatas]: boolean | IslandDistance;
  [DynamicPropertyID.PB]: number;
  [DynamicPropertyID.Attempts]: number;
  [DynamicPropertyID.SuccessAttempts]: number;
  [DynamicPropertyID.AverageTime]: number;
};

class DynamicProperty {
  private static dynamicData = {
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

  static postData() {
    const json = JSON.stringify(this.dynamicData);
    world.setDynamicProperty("auto:dynamicData", json);
  }

  static fetchData() {
    const json = JSON.parse(String(world.getDynamicProperty("auto:dynamicData")));
    this.dynamicData = json;
  }

  static getDynamicBridgerData<T extends DynamicPropertyID>(
    id: T,
    gameDataType?: "Distance" | "IsStairCased"
  ): DynamicBridgerDataType[T] {
    return id === DynamicPropertyID.GameDatas
      ? this.dynamicData[id][`${tempData.bridgerDirection}${gameDataType}`]
      : +this.dynamicData[id][tempData.bridgerMode];
  }

  static addDynamicBridgerData(id: DynamicPropertyID) {
    this.dynamicData[id][tempData.bridgerMode]++;
  }

  static setDynamicBridgerData<T extends DynamicPropertyID>(
    id: T,
    data: DynamicBridgerDataType[T],
    gameDataType?: "Distance" | "IsStairCased"
  ) {
    if (id === DynamicPropertyID.GameDatas) this.dynamicData[id][`${tempData.bridgerDirection}${gameDataType}`] = data;
    else this.dynamicData[id][tempData.bridgerMode] = data;
  }

  static resetDynamicBridgerData(id: DynamicPropertyID) {
    this.dynamicData[id][tempData.bridgerMode] = -1;
  }

  static resetDynamicData(): void {
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
    world.setDynamicProperty("auto:dynamicData", JSON.stringify(defaultData));
  }
}

export default DynamicProperty;
