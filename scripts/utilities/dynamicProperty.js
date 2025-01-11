import { DynamicPropertyID, BridgerTicksID, GameDataID } from "models/DynamicProperty";
import tempData from "./tempData";
import { getProperty, setProperty } from "./utilities";
class DynamicProperty {
    static makeRawData(arr) {
        return arr.reduce((accumulator, current, index) => {
            if (typeof current === "boolean")
                current = current ? "T" : "F";
            return index === 0 ? `${current}` : `${accumulator}|${current}`;
        }, "");
    }
    static postData() {
        Object.keys(this.dynamicBridgerData).map((data) => {
            const rawData = this.makeRawData(Object.values(this.dynamicBridgerData[data]));
            setProperty(data, rawData);
        });
    }
    static fetchData() {
        const rawDynamicProperties = {
            [DynamicPropertyID.GameDatas]: getProperty(DynamicPropertyID.GameDatas).toString().split("|"),
            [DynamicPropertyID.PB]: getProperty(DynamicPropertyID.PB).toString().split("|"),
            [DynamicPropertyID.Attempts]: getProperty(DynamicPropertyID.Attempts).toString().split("|"),
            [DynamicPropertyID.SuccessAttempts]: getProperty(DynamicPropertyID.SuccessAttempts).toString().split("|"),
        };
        Object.keys(this.dynamicBridgerData).map((dynamicId) => {
            if (dynamicId === DynamicPropertyID.GameDatas) {
                Object.keys(this.dynamicBridgerData[dynamicId]).map((gameData, index) => {
                    const fetchData = rawDynamicProperties[dynamicId][index];
                    if (fetchData === "T" || fetchData === "F")
                        this.dynamicBridgerData[dynamicId][gameData] = fetchData === "T" ? true : false;
                    else
                        this.dynamicBridgerData[dynamicId][gameData] = +fetchData;
                });
            }
            else {
                Object.keys(this.dynamicBridgerData[dynamicId]).map((gameData, index) => {
                    const fetchData = rawDynamicProperties[dynamicId][index];
                    this.dynamicBridgerData[dynamicId][gameData] = +fetchData;
                });
            }
        });
    }
    static getDynamicBridgerData(id, gameDataType) {
        return id === DynamicPropertyID.GameDatas
            ? this.dynamicBridgerData[id][`${tempData.bridgerDirection}${gameDataType}`]
            : +this.dynamicBridgerData[id][tempData.bridgerMode];
    }
    static addDynamicBridgerData(id) {
        this.dynamicBridgerData[id][tempData.bridgerMode]++;
    }
    static setDynamicBridgerData(id, data, gameDataType) {
        if (id === DynamicPropertyID.GameDatas)
            this.dynamicBridgerData[id][`${tempData.bridgerDirection}${gameDataType}`] = data;
        else
            this.dynamicBridgerData[id][tempData.bridgerMode] = data;
    }
    static resetDynamicBridgerData(id) {
        this.dynamicBridgerData[id][tempData.bridgerMode] = -1;
    }
    static RESETDYNAMICPROPERTY() {
        setProperty(DynamicPropertyID.GameDatas, "F|16|F|16");
        setProperty(DynamicPropertyID.PB, "-1|-1|-1|-1|-1|-1");
        setProperty(DynamicPropertyID.Attempts, "0|0|0|0|0|0");
        setProperty(DynamicPropertyID.SuccessAttempts, "0|0|0|0|0|0");
    }
}
DynamicProperty.dynamicBridgerData = {
    [DynamicPropertyID.GameDatas]: {
        [GameDataID.straightIsStairCased]: undefined,
        [GameDataID.straightDistance]: undefined,
        [GameDataID.inclinedIsStairCased]: undefined,
        [GameDataID.inclinedDistance]: undefined,
    },
    [DynamicPropertyID.PB]: {
        [BridgerTicksID.straight16blocks]: undefined,
        [BridgerTicksID.straight21blocks]: undefined,
        [BridgerTicksID.straight50blocks]: undefined,
        [BridgerTicksID.inclined16blocks]: undefined,
        [BridgerTicksID.inclined21blocks]: undefined,
        [BridgerTicksID.inclined50blocks]: undefined,
    },
    [DynamicPropertyID.Attempts]: {
        [BridgerTicksID.straight16blocks]: undefined,
        [BridgerTicksID.straight21blocks]: undefined,
        [BridgerTicksID.straight50blocks]: undefined,
        [BridgerTicksID.inclined16blocks]: undefined,
        [BridgerTicksID.inclined21blocks]: undefined,
        [BridgerTicksID.inclined50blocks]: undefined,
    },
    [DynamicPropertyID.SuccessAttempts]: {
        [BridgerTicksID.straight16blocks]: undefined,
        [BridgerTicksID.straight21blocks]: undefined,
        [BridgerTicksID.straight50blocks]: undefined,
        [BridgerTicksID.inclined16blocks]: undefined,
        [BridgerTicksID.inclined21blocks]: undefined,
        [BridgerTicksID.inclined50blocks]: undefined,
    },
};
export default DynamicProperty;
