import { world } from "@minecraft/server";

/**
 * booleanDatas:
 *   straightHeight: T - StairCased | F - Flat
 */

const dynamicProperty = {
  games: ["straight16b", "straight25b", "straight50b", "incline16b", "incline25b", "incline50b"],
  booleanDatas: ["straightHeight"],

  // checking arg game name is vaild
  checkGameName(game) {
    if (!this.games.includes(game)) {
      console.warn("[ERROR] Unknown game detected");
      return false;
    }
    return true;
  },

  checkBooleanData(boolean) {
    if (!this.booleanDatas.includes(boolean)) {
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

  // booleanData must be an element from booleanDatas
  getBoolean(booleanData) {
    if (!this.checkBooleanData) return;
    const rawDataArr = world.getDynamicProperty("auto:booleanDatas").split("|");
    const dataIndex = this.booleanDatas.indexOf(booleanData);
    return rawDataArr[dataIndex] === "T" ? true : false;
  },

  // booleanData must be an element from booleanDatas
  switchBoolean(booleanData) {
    if (!this.checkBooleanData) return;
    const rawDataArr = world.getDynamicProperty("auto:booleanDatas").split("|");
    const dataIndex = this.booleanDatas.indexOf(booleanData);
    rawDataArr[dataIndex] = rawDataArr[dataIndex] === "T" ? "F" : "T";
    const newRawData = rawDataArr.join("|");
    world.setDynamicProperty("auto:booleanDatas", newRawData);
  },
};

export default dynamicProperty;
