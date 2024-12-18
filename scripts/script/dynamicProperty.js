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

  // checking arg game name is vaild
  checkGameName(game) {
    if (!this.games.includes(game)) {
      console.warn("[ERROR] Unknown game detected");
      return false;
    }
    return true;
  },

  checkGameData(data) {
    if (!this.gameDatas.includes(data)) {
      console.warn("[ERROR] Unknown boolean data detected");
      return false;
    }
    return true;
  },

  getPB(game) {
    if (!this.checkGameName) return;
    const rawDataArr = world.getDynamicProperty("auto:pb").split("|");
    const gameIndex = this.games.indexOf(game);
    return Number(rawDataArr[gameIndex]);
  },

  setPB(game, ticks) {
    if (!this.checkGameName) return;
    const rawDataArr = world.getDynamicProperty("auto:pb").split("|");
    const gameIndex = this.games.indexOf(game);
    rawDataArr[gameIndex] = String(ticks);
    const newRawData = rawDataArr.join("|");
    world.setDynamicProperty("auto:pb", newRawData);
  },

  resetPB(game) {
    if (!this.checkGameName) return;
    this.setPB(game, -1);
  },

  getAttempts(game) {
    if (!this.checkGameName) return;
    const rawDataArr = world.getDynamicProperty("auto:atmps").split("|");
    const gameIndex = this.games.indexOf(game);
    return Number(rawDataArr[gameIndex]);
  },

  addAttempts(game) {
    if (!this.checkGameName) return;
    const rawDataArr = world.getDynamicProperty("auto:atmps").split("|");
    const gameIndex = this.games.indexOf(game);
    rawDataArr[gameIndex] = +rawDataArr[gameIndex] + 1;
    const newRawData = rawDataArr.join("|");
    world.setDynamicProperty("auto:atmps", newRawData);
  },

  getSuccessAttempts(game) {
    if (!this.checkGameName) return;
    const rawDataArr = world.getDynamicProperty("auto:successAtmps").split("|");
    const gameIndex = this.games.indexOf(game);
    return Number(rawDataArr[gameIndex]);
  },

  addSuccessAttempts(game) {
    if (!this.checkGameName) return;
    const rawDataArr = world.getDynamicProperty("auto:successAtmps").split("|");
    const gameIndex = this.games.indexOf(game);
    rawDataArr[gameIndex] = +rawDataArr[gameIndex] + 1;
    const newRawData = rawDataArr.join("|");
    world.setDynamicProperty("auto:successAtmps", newRawData);
  },

  getGameData(gameData) {
    if (!this.checkGameData) return;
    const rawDataArr = world.getDynamicProperty("auto:gameDatas").split("|");
    const dataIndex = Object.keys(this.gameDatas).indexOf(gameData);
    const rawValue = rawDataArr[dataIndex];
    return this.gameDatas[gameData][rawValue];
  },

  setGameData(gameData, data) {
    if (!this.checkGameData) return;
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
    world.setDynamicProperty("auto:atmps", "-1|-1|-1|-1|-1|-1");
    world.setDynamicProperty("auto:successAtmps", "-1|-1|-1|-1|-1|-1");
    world.setDynamicProperty("auto:gameDatas", "F|2");
  },
};

export default dynamicProperty;
