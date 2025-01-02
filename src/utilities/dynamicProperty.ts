import { world } from "@minecraft/server";
import { GameID, DynamicPropertyID, DynamicGame, GameDataID } from "models/DynamicProperty";

const getProperty = function (dynamicId: DynamicPropertyID): string {
  return world.getDynamicProperty(dynamicId).toString();
};

const setProperty = function (dynamicId: DynamicPropertyID, value: any): void {
  world.setDynamicProperty(dynamicId, value);
};

const getGameValue = function (game: DynamicGame, dynamicId: DynamicPropertyID): number {
  const rawDataArr = getProperty(dynamicId).split("|");
  const gameIndex = Object.values(DynamicGame).indexOf(game);
  return +rawDataArr[gameIndex];
};

const setGameValue = function (game: DynamicGame, dynamicId: DynamicPropertyID, value: number): void {
  const rawDataArr = getProperty(dynamicId).split("|");
  const gameIndex = Object.values(DynamicGame).indexOf(game);
  rawDataArr[gameIndex] = String(value);
  setProperty(dynamicId, rawDataArr.join("|"));
};

class dynamicProperty {
  static gameDatas = {
    [GameDataID.straightIsStairCased]: {
      T: true,
      F: false,
    },
    [GameDataID.straightDistance]: {
      1: "16",
      2: "21",
      3: "50",
    },
  };

  // GAME ID
  static getGameId(): GameID {
    return <GameID>getProperty(DynamicPropertyID.GameID);
  }

  static setGameId(gameId: GameID): void {
    setProperty(DynamicPropertyID.GameID, gameId);
  }

  // PERSONAL BEST
  static getPB(game: DynamicGame): number {
    return getGameValue(game, DynamicPropertyID.PB);
  }

  static setPB(game: DynamicGame, ticks: number): void {
    setGameValue(game, DynamicPropertyID.PB, ticks);
  }

  static resetPB(game: DynamicGame): void {
    this.setPB(game, -1);
  }

  // ATTEMPTS
  static getAttempts(game: DynamicGame): number {
    return getGameValue(game, DynamicPropertyID.Attemps);
  }

  static addAttempts(game: DynamicGame): void {
    setGameValue(game, DynamicPropertyID.Attemps, this.getAttempts(game) + 1);
  }

  // SUCCESS ATTEMPTS
  static getSuccessAttempts(game: DynamicGame): number {
    return getGameValue(game, DynamicPropertyID.SuccessAttempts);
  }

  static addSuccessAttempts(game: DynamicGame): void {
    setGameValue(game, DynamicPropertyID.SuccessAttempts, this.getSuccessAttempts(game) + 1);
  }

  // GAME DATA
  static getGameData(gameData: GameDataID): any {
    const rawDataArr = getProperty(DynamicPropertyID.GameDatas).toString().split("|");
    const dataIndex = Object.values(GameDataID).indexOf(gameData);
    const rawValue = rawDataArr[dataIndex];
    return this.gameDatas[gameData][rawValue];
  }

  static setGameData(gameData: GameDataID, data: any): void {
    const rawDataArr = getProperty(DynamicPropertyID.GameDatas).toString().split("|");
    const dataIndex = Object.values(GameDataID).indexOf(gameData);
    rawDataArr[dataIndex] = Object.keys(this.gameDatas[gameData]).find(
      (key) => String(this.gameDatas[gameData][key]) === String(data)
    );
    const newRawData = rawDataArr.join("|");
    world.setDynamicProperty("auto:gameDatas", newRawData);
  }

  static resetdynamicProperties(): void {
    setProperty(DynamicPropertyID.GameID, GameID.lobby);
    setProperty(DynamicPropertyID.GameDatas, "F|1");

    setProperty(DynamicPropertyID.PB, "-1|-1|-1|-1|-1|-1");
    setProperty(DynamicPropertyID.Attemps, "0|0|0|0|0|0");
    setProperty(DynamicPropertyID.SuccessAttempts, "0|0|0|0|0|0");
  }
}

export default dynamicProperty;
