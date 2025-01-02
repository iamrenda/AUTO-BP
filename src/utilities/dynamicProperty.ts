import { world } from "@minecraft/server";

import { GameID, DynamicPropertyName, DynamicGameID, GameDataID } from "models/DynamicProperty";

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

  static getGameId(): GameID {
    return <GameID>world.getDynamicProperty("auto:gameId");
  }

  static setGameId(gameId: GameID): void {
    world.setDynamicProperty("auto:gameId", gameId);
  }

  static getPB(game: DynamicGameID): number {
    const rawDataArr = world.getDynamicProperty("auto:pb").toString().split("|");
    const gameIndex = Object.values(DynamicGameID).indexOf(game);
    return +rawDataArr[gameIndex];
  }

  static setPB(game: DynamicGameID, ticks: number): void {
    const rawDataArr = world.getDynamicProperty("auto:pb").toString().split("|");
    const gameIndex = Object.values(DynamicGameID).indexOf(game);
    rawDataArr[gameIndex] = String(ticks);
    const newRawData = rawDataArr.join("|");
    world.setDynamicProperty("auto:pb", newRawData);
  }

  static resetPB(game: DynamicGameID): void {
    this.setPB(game, -1);
  }

  static getAttempts(game: DynamicGameID): number {
    const rawDataArr = world.getDynamicProperty("auto:atmps").toString().split("|");
    const gameIndex = Object.values(DynamicGameID).indexOf(game);
    return +rawDataArr[gameIndex];
  }

  static addAttempts(game: DynamicGameID): void {
    const rawDataArr = world.getDynamicProperty("auto:atmps").toString().split("|");
    const gameIndex = Object.values(DynamicGameID).indexOf(game);
    rawDataArr[gameIndex] = String(+rawDataArr[gameIndex] + 1);
    const newRawData = rawDataArr.join("|");
    world.setDynamicProperty("auto:atmps", newRawData);
  }

  static getSuccessAttempts(game: DynamicGameID): number {
    const rawDataArr = world.getDynamicProperty("auto:successAtmps").toString().split("|");
    const gameIndex = Object.values(DynamicGameID).indexOf(game);
    return +rawDataArr[gameIndex];
  }

  static addSuccessAttempts(game: DynamicGameID): void {
    const rawDataArr = world.getDynamicProperty("auto:successAtmps").toString().split("|");
    const gameIndex = Object.values(DynamicGameID).indexOf(game);
    rawDataArr[gameIndex] = String(+rawDataArr[gameIndex] + 1);
    const newRawData = rawDataArr.join("|");
    world.setDynamicProperty("auto:successAtmps", newRawData);
  }

  static getGameData(gameData: GameDataID): any {
    const rawDataArr = world.getDynamicProperty("auto:gameDatas").toString().split("|");
    const dataIndex = Object.values(GameDataID).indexOf(gameData);
    const rawValue = rawDataArr[dataIndex];
    return this.gameDatas[gameData][rawValue];
  }

  static setGameData(gameData: GameDataID, data: any): void {
    const rawDataArr = world.getDynamicProperty("auto:gameDatas").toString().split("|");
    const dataIndex = Object.values(GameDataID).indexOf(gameData);
    rawDataArr[dataIndex] = Object.keys(this.gameDatas[gameData]).find(
      (key) => String(this.gameDatas[gameData][key]) === String(data)
    );
    const newRawData = rawDataArr.join("|");
    world.setDynamicProperty("auto:gameDatas", newRawData);
  }

  static resetdynamicProperties(): void {
    world.setDynamicProperty("auto:gameId", "lobby");
    world.setDynamicProperty("auto:gameDatas", "F|1");

    world.setDynamicProperty("auto:pb", "-1|-1|-1|-1|-1|-1");
    world.setDynamicProperty("auto:atmps", "0|0|0|0|0|0");
    world.setDynamicProperty("auto:successAtmps", "0|0|0|0|0|0");
  }
}

export default dynamicProperty;
