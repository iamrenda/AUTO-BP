import { world } from "@minecraft/server";

/**
 * gameDatas:
 *   straightHeight: S - StairCased | F - Flat
 *   straightDistance: 1 - 16blocks | 2 - 21blocks | 3 - 50blocks
 */
const dynamicProperty = {
  games: ["straight16b", "straight21b", "straight50b", "incline16b", "incline25b", "incline50b"],
  gameDatas: {
    straightIsStairCased: {
      // returned Boolean
      T: true,
      F: false,
    },
    straightDistance: {
      // returned string
      1: "16",
      2: "21",
      3: "50",
    },
  },

  getGameId() {
    return world.getDynamicProperty("auto:gameId");
  },

  setGameId(gameId) {
    world.setDynamicProperty("auto:gameId", gameId);
  },

  getPB(game) {
    const rawDataArr = world.getDynamicProperty("auto:pb").split("|");
    const gameIndex = this.games.indexOf(game);
    return Number(rawDataArr[gameIndex]);
  },

  setPB(game, ticks) {
    const rawDataArr = world.getDynamicProperty("auto:pb").split("|");
    const gameIndex = this.games.indexOf(game);
    rawDataArr[gameIndex] = String(ticks);
    const newRawData = rawDataArr.join("|");
    world.setDynamicProperty("auto:pb", newRawData);
  },

  resetPB(game) {
    this.setPB(game, -1);
  },

  getAttempts(game) {
    const rawDataArr = world.getDynamicProperty("auto:atmps").split("|");
    const gameIndex = this.games.indexOf(game);
    return Number(rawDataArr[gameIndex]);
  },

  addAttempts(game) {
    const rawDataArr = world.getDynamicProperty("auto:atmps").split("|");
    const gameIndex = this.games.indexOf(game);
    rawDataArr[gameIndex] = +rawDataArr[gameIndex] + 1;
    const newRawData = rawDataArr.join("|");
    world.setDynamicProperty("auto:atmps", newRawData);
  },

  getSuccessAttempts(game) {
    const rawDataArr = world.getDynamicProperty("auto:successAtmps").split("|");
    const gameIndex = this.games.indexOf(game);
    return Number(rawDataArr[gameIndex]);
  },

  addSuccessAttempts(game) {
    const rawDataArr = world.getDynamicProperty("auto:successAtmps").split("|");
    const gameIndex = this.games.indexOf(game);
    rawDataArr[gameIndex] = +rawDataArr[gameIndex] + 1;
    const newRawData = rawDataArr.join("|");
    world.setDynamicProperty("auto:successAtmps", newRawData);
  },

  getGameData(gameData) {
    const rawDataArr = world.getDynamicProperty("auto:gameDatas").split("|");
    const dataIndex = Object.keys(this.gameDatas).indexOf(gameData);
    const rawValue = rawDataArr[dataIndex];
    return this.gameDatas[gameData][rawValue];
  },

  setGameData(gameData, data) {
    const rawDataArr = world.getDynamicProperty("auto:gameDatas").split("|");
    const dataIndex = Object.keys(this.gameDatas).indexOf(gameData);
    rawDataArr[dataIndex] = Object.keys(this.gameDatas[gameData]).find(
      (key) => String(this.gameDatas[gameData][key]) === String(data)
    );
    const newRawData = rawDataArr.join("|");
    world.setDynamicProperty("auto:gameDatas", newRawData);
  },

  resetdynamicProperties() {
    world.setDynamicProperty("auto:pb", "-1|-1|-1|-1|-1|-1");
    world.setDynamicProperty("auto:atmps", "0|0|0|0|0|0");
    world.setDynamicProperty("auto:successAtmps", "0|0|0|0|0|0");
    world.setDynamicProperty("auto:gameDatas", "F|1");
  },
};

export default dynamicProperty;
