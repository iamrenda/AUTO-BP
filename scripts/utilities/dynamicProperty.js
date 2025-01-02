import { world } from "@minecraft/server";
import { GameID, DynamicPropertyID, DynamicGame, GameDataID } from "models/DynamicProperty";
const getProperty = function (dynamicId) {
    return world.getDynamicProperty(dynamicId).toString();
};
const setProperty = function (dynamicId, value) {
    world.setDynamicProperty(dynamicId, value);
};
const getGameValue = function (game, dynamicId) {
    const rawDataArr = getProperty(dynamicId).split("|");
    const gameIndex = Object.values(DynamicGame).indexOf(game);
    return +rawDataArr[gameIndex];
};
const setGameValue = function (game, dynamicId, value) {
    const rawDataArr = getProperty(dynamicId).split("|");
    const gameIndex = Object.values(DynamicGame).indexOf(game);
    rawDataArr[gameIndex] = String(value);
    setProperty(dynamicId, rawDataArr.join("|"));
};
class dynamicProperty {
    // GAME ID
    static getGameId() {
        return getProperty(DynamicPropertyID.GameID);
    }
    static setGameId(gameId) {
        setProperty(DynamicPropertyID.GameID, gameId);
    }
    // PERSONAL BEST
    static getPB(game) {
        return getGameValue(game, DynamicPropertyID.PB);
    }
    static setPB(game, ticks) {
        setGameValue(game, DynamicPropertyID.PB, ticks);
    }
    static resetPB(game) {
        this.setPB(game, -1);
    }
    // ATTEMPTS
    static getAttempts(game) {
        return getGameValue(game, DynamicPropertyID.Attemps);
    }
    static addAttempts(game) {
        setGameValue(game, DynamicPropertyID.Attemps, this.getAttempts(game) + 1);
    }
    // SUCCESS ATTEMPTS
    static getSuccessAttempts(game) {
        return getGameValue(game, DynamicPropertyID.SuccessAttempts);
    }
    static addSuccessAttempts(game) {
        setGameValue(game, DynamicPropertyID.SuccessAttempts, this.getSuccessAttempts(game) + 1);
    }
    // GAME DATA
    static getGameData(gameData) {
        const rawDataArr = getProperty(DynamicPropertyID.GameDatas).toString().split("|");
        const dataIndex = Object.values(GameDataID).indexOf(gameData);
        const rawValue = rawDataArr[dataIndex];
        return this.gameDatas[gameData][rawValue];
    }
    static setGameData(gameData, data) {
        const rawDataArr = getProperty(DynamicPropertyID.GameDatas).toString().split("|");
        const dataIndex = Object.values(GameDataID).indexOf(gameData);
        rawDataArr[dataIndex] = Object.keys(this.gameDatas[gameData]).find((key) => String(this.gameDatas[gameData][key]) === String(data));
        const newRawData = rawDataArr.join("|");
        world.setDynamicProperty("auto:gameDatas", newRawData);
    }
    static resetdynamicProperties() {
        setProperty(DynamicPropertyID.GameID, GameID.lobby);
        setProperty(DynamicPropertyID.GameDatas, "F|1");
        setProperty(DynamicPropertyID.PB, "-1|-1|-1|-1|-1|-1");
        setProperty(DynamicPropertyID.Attemps, "0|0|0|0|0|0");
        setProperty(DynamicPropertyID.SuccessAttempts, "0|0|0|0|0|0");
    }
}
dynamicProperty.gameDatas = {
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
export default dynamicProperty;
