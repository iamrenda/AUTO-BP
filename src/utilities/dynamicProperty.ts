import { DynamicPropertyID, BridgerTicksID, GameDataID } from "../models/DynamicProperty";
import tempData from "./tempData";
import { getProperty, setProperty } from "./utilities";

type IslandDistance = 16 | 21 | 50;

type DynamicBridgerDataType = {
  [DynamicPropertyID.GameDatas]: boolean | IslandDistance;
  [DynamicPropertyID.PB]: number;
  [DynamicPropertyID.Attempts]: number;
  [DynamicPropertyID.SuccessAttempts]: number;
};

class DynamicProperty {
  private static makeRawData(arr: any): string {
    return arr.reduce((accumulator: string, current, index: number) => {
      if (typeof current === "boolean") current = current ? "T" : "F";
      return index === 0 ? `${current}` : `${accumulator}|${current}`;
    }, "");
  }

  private static dynamicBridgerData = {
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
  };

  static postData() {
    Object.keys(this.dynamicBridgerData).map((data: DynamicPropertyID) => {
      const rawData = this.makeRawData(Object.values(this.dynamicBridgerData[data]));
      setProperty(data, rawData);
    });
  }

  static fetchData() {
    const rawDynamicProperties = {
      [DynamicPropertyID.GameDatas]: getProperty(DynamicPropertyID.GameDatas).toString().split("|"),
      [DynamicPropertyID.PB]: getProperty(DynamicPropertyID.PB).toString().split("|"),
      [DynamicPropertyID.Attempts]: getProperty(DynamicPropertyID.Attempts).toString().split("|"),
      [DynamicPropertyID.SuccessAttempts]: getProperty(DynamicPropertyID.SuccessAttempts).toString().split("|"),
    };
    Object.keys(this.dynamicBridgerData).map((dynamicId: DynamicPropertyID) => {
      if (dynamicId === DynamicPropertyID.GameDatas) {
        Object.keys(this.dynamicBridgerData[dynamicId]).map((gameData, index) => {
          const fetchData = rawDynamicProperties[dynamicId][index];
          if (fetchData === "T" || fetchData === "F")
            this.dynamicBridgerData[dynamicId][gameData] = fetchData === "T" ? true : false;
          else this.dynamicBridgerData[dynamicId][gameData] = +fetchData;
        });
      } else {
        Object.keys(this.dynamicBridgerData[dynamicId]).map((gameData, index) => {
          const fetchData = rawDynamicProperties[dynamicId][index];
          this.dynamicBridgerData[dynamicId][gameData] = +fetchData;
        });
      }
    });
  }

  static getDynamicBridgerData<T extends DynamicPropertyID>(
    id: T,
    gameDataType?: "Distance" | "IsStairCased"
  ): DynamicBridgerDataType[T] {
    return id === DynamicPropertyID.GameDatas
      ? this.dynamicBridgerData[id][`${tempData.bridgerDirection}${gameDataType}`]
      : +this.dynamicBridgerData[id][tempData.bridgerMode];
  }

  static addDynamicBridgerData(id: DynamicPropertyID) {
    this.dynamicBridgerData[id][tempData.bridgerMode]++;
  }

  static setDynamicBridgerData<T extends DynamicPropertyID>(
    id: T,
    data: DynamicBridgerDataType[T],
    gameDataType?: "Distance" | "IsStairCased"
  ) {
    if (id === DynamicPropertyID.GameDatas)
      this.dynamicBridgerData[id][`${tempData.bridgerDirection}${gameDataType}`] = data;
    else this.dynamicBridgerData[id][tempData.bridgerMode] = data;
  }

  static resetDynamicBridgerData(id: DynamicPropertyID) {
    this.dynamicBridgerData[id][tempData.bridgerMode] = -1;
  }

  static RESETDYNAMICPROPERTY(): void {
    setProperty(DynamicPropertyID.GameDatas, "F|16|F|16");
    setProperty(DynamicPropertyID.PB, "-1|-1|-1|-1|-1|-1");
    setProperty(DynamicPropertyID.Attempts, "0|0|0|0|0|0");
    setProperty(DynamicPropertyID.SuccessAttempts, "0|0|0|0|0|0");
  }
}

export default DynamicProperty;
