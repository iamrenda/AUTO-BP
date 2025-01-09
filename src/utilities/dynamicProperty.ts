import { world } from "@minecraft/server";
import { DynamicPropertyID, BridgerTempID, GameDataID } from "models/DynamicProperty";

type GameDataMap = {
  [GameDataID.straightIsStairCased]: boolean;
  [GameDataID.straightDistance]: number;
  [GameDataID.inclinedIsStairCased]: boolean;
  [GameDataID.inclinedDistance]: number;
};

const getProperty = function (dynamicId: DynamicPropertyID): string {
  return world.getDynamicProperty(dynamicId).toString();
};

const setProperty = function (dynamicId: DynamicPropertyID, value: any): void {
  world.setDynamicProperty(dynamicId, value);
};

const getGameValue = function (game: BridgerTempID, dynamicId: DynamicPropertyID): number {
  const rawDataArr = getProperty(dynamicId).split("|");
  const gameIndex = Object.values(BridgerTempID).indexOf(game);
  return +rawDataArr[gameIndex];
};

const setGameValue = function (game: BridgerTempID, dynamicId: DynamicPropertyID, value: number): void {
  const rawDataArr = getProperty(dynamicId).split("|");
  const gameIndex = Object.values(BridgerTempID).indexOf(game);
  rawDataArr[gameIndex] = String(value);
  setProperty(dynamicId, rawDataArr.join("|"));
};

class dynamicProperty {
  static gameDatas: Record<GameDataID, { [key: string]: any }> = {
    [GameDataID.straightIsStairCased]: {
      T: true,
      F: false,
    },
    [GameDataID.straightDistance]: {
      1: 16,
      2: 21,
      3: 50,
    },
    [GameDataID.inclinedIsStairCased]: {
      T: true,
      F: false,
    },
    [GameDataID.inclinedDistance]: {
      1: 16,
      2: 21,
      3: 50,
    },
  };

  // PERSONAL BEST
  static getPB(game: BridgerTempID): number {
    return getGameValue(game, DynamicPropertyID.PB);
  }

  static setPB(game: BridgerTempID, ticks: number): void {
    setGameValue(game, DynamicPropertyID.PB, ticks);
  }

  static resetPB(game: BridgerTempID): void {
    this.setPB(game, -1);
  }

  // ATTEMPTS
  static getAttempts(game: BridgerTempID): number {
    return getGameValue(game, DynamicPropertyID.Attempts);
  }

  static addAttempts(game: BridgerTempID): void {
    setGameValue(game, DynamicPropertyID.Attempts, this.getAttempts(game) + 1);
  }

  // SUCCESS ATTEMPTS
  static getSuccessAttempts(game: BridgerTempID): number {
    return getGameValue(game, DynamicPropertyID.SuccessAttempts);
  }

  static addSuccessAttempts(game: BridgerTempID): void {
    setGameValue(game, DynamicPropertyID.SuccessAttempts, this.getSuccessAttempts(game) + 1);
  }

  // GAME DATA
  static getGameData<T extends GameDataID>(gameData: T): GameDataMap[T] {
    const rawDataArr = getProperty(DynamicPropertyID.GameDatas).toString().split("|");
    const dataIndex = Object.values(GameDataID).indexOf(gameData);
    const rawValue = rawDataArr[dataIndex];
    return this.gameDatas[gameData][rawValue];
  }

  static setGameData<T extends GameDataID>(gameData: T, data: GameDataMap[T]): void {
    const rawDataArr = getProperty(DynamicPropertyID.GameDatas).toString().split("|");
    const dataIndex = Object.values(GameDataID).indexOf(gameData);
    rawDataArr[dataIndex] = Object.keys(this.gameDatas[gameData]).find(
      (key) => String(this.gameDatas[gameData][key]) === String(data)
    );
    const newRawData = rawDataArr.join("|");
    world.setDynamicProperty("auto:gameDatas", newRawData);
  }

  static resetdynamicProperties(): void {
    setProperty(DynamicPropertyID.GameDatas, "F|1|F|1");
    setProperty(DynamicPropertyID.PB, "-1|-1|-1|-1|-1|-1");
    setProperty(DynamicPropertyID.Attempts, "0|0|0|0|0|0");
    setProperty(DynamicPropertyID.SuccessAttempts, "0|0|0|0|0|0");
  }
}

export default dynamicProperty;
