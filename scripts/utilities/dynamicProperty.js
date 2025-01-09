import { world } from "@minecraft/server";
import { DynamicPropertyID, BridgerTempID, GameDataID } from "models/DynamicProperty";
const getProperty = function (dynamicId) {
    return world.getDynamicProperty(dynamicId).toString();
};
const setProperty = function (dynamicId, value) {
    world.setDynamicProperty(dynamicId, value);
};
const getGameValue = function (game, dynamicId) {
    const rawDataArr = getProperty(dynamicId).split("|");
    const gameIndex = Object.values(BridgerTempID).indexOf(game);
    return +rawDataArr[gameIndex];
};
const setGameValue = function (game, dynamicId, value) {
    const rawDataArr = getProperty(dynamicId).split("|");
    const gameIndex = Object.values(BridgerTempID).indexOf(game);
    rawDataArr[gameIndex] = String(value);
    setProperty(dynamicId, rawDataArr.join("|"));
};
class dynamicProperty {
    static getPB(game) {
        return getGameValue(game, DynamicPropertyID.PB);
    }
    static setPB(game, ticks) {
        setGameValue(game, DynamicPropertyID.PB, ticks);
    }
    static resetPB(game) {
        this.setPB(game, -1);
    }
    static getAttempts(game) {
        return getGameValue(game, DynamicPropertyID.Attempts);
    }
    static addAttempts(game) {
        setGameValue(game, DynamicPropertyID.Attempts, this.getAttempts(game) + 1);
    }
    static getSuccessAttempts(game) {
        return getGameValue(game, DynamicPropertyID.SuccessAttempts);
    }
    static addSuccessAttempts(game) {
        setGameValue(game, DynamicPropertyID.SuccessAttempts, this.getSuccessAttempts(game) + 1);
    }
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
        setProperty(DynamicPropertyID.GameDatas, "F|1|F|1");
        setProperty(DynamicPropertyID.PB, "-1|-1|-1|-1|-1|-1");
        setProperty(DynamicPropertyID.Attempts, "0|0|0|0|0|0");
        setProperty(DynamicPropertyID.SuccessAttempts, "0|0|0|0|0|0");
    }
}
dynamicProperty.gameDatas = {
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
export default dynamicProperty;
