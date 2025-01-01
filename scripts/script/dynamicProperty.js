import { world } from "@minecraft/server";
/**
 * games:
 *   "lobby", "straight16b", "straight21b", "straight50b", "incline16b", "incline25b", "incline50b", "clutcher"
 */
/**
 * gameDatas:
 *   straightHeight: S - StairCased | F - Flat
 *   straightDistance: 1 - 16blocks | 2 - 21blocks | 3 - 50blocks
 */
class dynamicProperty {
    static getGameId() {
        return world.getDynamicProperty("auto:gameId");
    }
    static setGameId(gameId) {
        world.setDynamicProperty("auto:gameId", gameId);
    }
    static getPB(game) {
        const rawDataArr = world.getDynamicProperty("auto:pb").split("|");
        const gameIndex = this.games.indexOf(game);
        return Number(rawDataArr[gameIndex]);
    }
    static setPB(game, ticks) {
        const rawDataArr = world.getDynamicProperty("auto:pb").split("|");
        const gameIndex = this.games.indexOf(game);
        rawDataArr[gameIndex] = String(ticks);
        const newRawData = rawDataArr.join("|");
        world.setDynamicProperty("auto:pb", newRawData);
    }
    static resetPB(game) {
        this.setPB(game, -1);
    }
    static getAttempts(game) {
        const rawDataArr = world.getDynamicProperty("auto:atmps").split("|");
        const gameIndex = this.games.indexOf(game);
        return Number(rawDataArr[gameIndex]);
    }
    static addAttempts(game) {
        const rawDataArr = world.getDynamicProperty("auto:atmps").split("|");
        const gameIndex = this.games.indexOf(game);
        rawDataArr[gameIndex] = +rawDataArr[gameIndex] + 1;
        const newRawData = rawDataArr.join("|");
        world.setDynamicProperty("auto:atmps", newRawData);
    }
    static getSuccessAttempts(game) {
        const rawDataArr = world.getDynamicProperty("auto:successAtmps").split("|");
        const gameIndex = this.games.indexOf(game);
        return Number(rawDataArr[gameIndex]);
    }
    static addSuccessAttempts(game) {
        const rawDataArr = world.getDynamicProperty("auto:successAtmps").split("|");
        const gameIndex = this.games.indexOf(game);
        rawDataArr[gameIndex] = +rawDataArr[gameIndex] + 1;
        const newRawData = rawDataArr.join("|");
        world.setDynamicProperty("auto:successAtmps", newRawData);
    }
    static getGameData(gameData) {
        const rawDataArr = world.getDynamicProperty("auto:gameDatas").split("|");
        const dataIndex = Object.keys(this.gameDatas).indexOf(gameData);
        const rawValue = rawDataArr[dataIndex];
        return this.gameDatas[gameData][rawValue];
    }
    static setGameData(gameData, data) {
        const rawDataArr = world.getDynamicProperty("auto:gameDatas").split("|");
        const dataIndex = Object.keys(this.gameDatas).indexOf(gameData);
        rawDataArr[dataIndex] = Object.keys(this.gameDatas[gameData]).find((key) => String(this.gameDatas[gameData][key]) === String(data));
        const newRawData = rawDataArr.join("|");
        world.setDynamicProperty("auto:gameDatas", newRawData);
    }
    static resetdynamicProperties() {
        world.setDynamicProperty("auto:pb", "-1|-1|-1|-1|-1|-1");
        world.setDynamicProperty("auto:atmps", "0|0|0|0|0|0");
        world.setDynamicProperty("auto:successAtmps", "0|0|0|0|0|0");
        world.setDynamicProperty("auto:gameDatas", "F|1");
    }
}
dynamicProperty.games = ["straight16b", "straight21b", "straight50b", "incline16b", "incline25b", "incline50b"];
dynamicProperty.gameDatas = {
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
};
export default dynamicProperty;
