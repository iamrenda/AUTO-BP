import { world } from "@minecraft/server";

const gameData = {
  games: [
    "straight16b",
    "straight25b",
    "straight50b",
    "incline16b",
    "incline25b",
    "incline50b",
  ],

  getPB(game) {
    if (!this.games.includes(game))
      console.warn("[ERROR] Unknown game detected");
    const rawDataArr = world.getDynamicProperty("auto:pb").split("|");
    const gameIndex = this.games.indexOf(game);
    return Number(rawDataArr[gameIndex]);
  },

  setPB(game, ticks) {
    if (!this.games.includes(game))
      console.warn("[ERROR] Unknown game detected");
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
    if (!this.games.includes(game))
      console.warn("[ERROR] Unknown game detected");
    const rawDataArr = world.getDynamicProperty("auto:atmps").split("|");
    const gameIndex = this.games.indexOf(game);
    return Number(rawDataArr[gameIndex]);
  },

  addAttempts(game) {
    if (!this.games.includes(game))
      console.warn("[ERROR] Unknown game detected");
    const rawDataArr = world.getDynamicProperty("auto:atmps").split("|");
    const gameIndex = this.games.indexOf(game);
    rawDataArr[gameIndex] = +rawDataArr[gameIndex] + 1;
    const newRawData = rawDataArr.join("|");
    world.setDynamicProperty("auto:atmps", newRawData);
  },

  getSuccessAttempts(game) {
    if (!this.games.includes(game))
      console.warn("[ERROR] Unknown game detected");
    const rawDataArr = world.getDynamicProperty("auto:successAtmps").split("|");
    const gameIndex = this.games.indexOf(game);
    return Number(rawDataArr[gameIndex]);
  },

  addSuccessAttempts(game) {
    if (!this.games.includes(game))
      console.warn("[ERROR] Unknown game detected");
    const rawDataArr = world.getDynamicProperty("auto:successAtmps").split("|");
    const gameIndex = this.games.indexOf(game);
    rawDataArr[gameIndex] = +rawDataArr[gameIndex] + 1;
    const newRawData = rawDataArr.join("|");
    world.setDynamicProperty("auto:successAtmps", newRawData);
  },
};

export default gameData;
