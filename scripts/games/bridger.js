import * as mc from "@minecraft/server";
import * as exp from "../utilities/utilities";
import * as data from "../utilities/staticData";
import * as form from "forms/bridger";
import dynamicProperty from "../utilities/dynamicProperty";
import { confirmationForm } from "forms/utility";
import { GameDataID } from "models/DynamicProperty";
import tempData from "utilities/tempData";
import { DynamicPropertyID } from "models/DynamicProperty";
const bridger = {
    player: undefined,
    storedLocations: [],
    blocks: 0,
    ticks: 0,
    plateDisabled: false,
    timer: undefined,
    autoReq: undefined,
};
const tempBridgerData = {
    [DynamicPropertyID.GameDatas]: [undefined, undefined],
    [DynamicPropertyID.PB]: undefined,
    [DynamicPropertyID.Attempts]: undefined,
    [DynamicPropertyID.SuccessAttempts]: undefined,
};
const BASE_LOCATION = {
    straight: { x: 9993, y: 93, z: 10003 },
    inclined: { x: 9970, y: 93, z: 10001 },
};
const HEIGHT_DIFF = {
    16: 1,
    21: 2,
    50: 5,
};
const tickToSec = function (ticks) {
    return (ticks / 20).toFixed(2);
};
const showMessage = function (wasPB) {
    const bridgerGame = tempData.bridgerMode;
    const gameId = tempData.gameID;
    const getMessage = (distance, pb, time, newPB = false) => `§7----------------------------§r
   §bBridger§r §8§o- Version 4§r

   §6Distance:§r §f${distance} Blocks
   §6Your Personal Best:§r §f${pb === -1 ? "--.--" : tickToSec(pb)}§f
   §6Time Recorded:§r §f${tickToSec(time)}§r
   ${newPB ? "§d§lNEW PERSONAL BEST!!§r\n" : ""}
§7----------------------------`;
    if (["straightBridger", "inclinedBridger"].includes(gameId)) {
        const distance = gameId === "straightBridger"
            ? dynamicProperty.getGameData(GameDataID.straightDistance)
            : dynamicProperty.getGameData(GameDataID.inclinedDistance);
        const message = getMessage(distance, dynamicProperty.getPB(bridgerGame), bridger.ticks, wasPB);
        bridger.player.sendMessage(message);
    }
};
const floatingEntity = function () {
    switch (tempData.gameID) {
        case "straightBridger":
            return mc.world.getDimension("overworld").getEntities({ location: { x: 9997.2, y: 100.45, z: 10004.51 } })[0];
        case "inclinedBridger":
            return mc.world.getDimension("overworld").getEntities({ location: { x: 9974.08, y: 100.0, z: 10002.96 } })[0];
    }
};
const updateFloatingText = () => {
    const game = tempData.bridgerMode;
    const pbData = dynamicProperty.getPB(game);
    const info = {
        pb: pbData === -1 ? "--.--" : tickToSec(pbData),
        attempts: dynamicProperty.getAttempts(game),
        successAttempts: dynamicProperty.getSuccessAttempts(game),
    };
    const successFailRatio = (info.successAttempts / info.attempts).toFixed(2);
    const distance = dynamicProperty.getGameData(GameDataID[tempData.gameID === "straightBridger" ? "straightDistance" : "inclinedDistance"]);
    const displayText = `§b${bridger.player.nameTag}§r §7-§r §o§7${distance} blocks§r
§6Personal Best:§r §f${info.pb}§r
§6Bridging Attempts:§r §f${info.attempts}§r
§6Successful Attempts:§r §f${info.successAttempts}§r
§6Success / Fail Ratio:§r §f${successFailRatio}`;
    floatingEntity().nameTag = displayText;
};
const resetBridgerData = function () {
    bridger.blocks = 0;
    bridger.ticks = 0;
    bridger.storedLocations = [];
};
const resetMap = function (wasAttempt = true) {
    const gameId = tempData.gameID;
    if (bridger.storedLocations.length)
        bridger.storedLocations.map((location) => mc.world.getDimension("overworld").setBlockType(location, "minecraft:air"));
    resetBridgerData();
    if (wasAttempt)
        updateFloatingText();
    if (wasAttempt)
        data.getInvData(gameId);
    wasAttempt
        ? exp.teleportation(bridger.player, data.locationData[gameId])
        : exp.teleportation(bridger.player, data.locationData.lobby);
};
const enablePlate = function (cancelTimer = false) {
    bridger.plateDisabled = false;
    if (cancelTimer)
        mc.system.clearRun(bridger.autoReq);
    resetMap();
};
const getLocation = function (direction, distance, isStairCased) {
    const baseLocation = BASE_LOCATION[direction];
    return {
        x: direction === "straight" ? baseLocation.x : baseLocation.x - distance,
        y: isStairCased ? baseLocation.y + HEIGHT_DIFF[distance] : baseLocation.y,
        z: baseLocation.z + distance,
    };
};
const fillAndPlace = function (structure, distance, { distance: distance1, isStairCased: isStairCased1 }, { distance: distance2, isStairCased: isStairCased2 }) {
    const dimension = mc.world.getDimension("overworld");
    const fillAirLocation = {
        start: { x: undefined, y: undefined, z: undefined },
        end: { x: undefined, y: undefined, z: undefined },
    };
    let structurePlaceLocation = { x: undefined, y: undefined, z: undefined };
    if (distance1 === 16)
        fillAirLocation.start = getLocation(distance, 16, isStairCased1);
    if (distance1 === 21)
        fillAirLocation.start = getLocation(distance, 21, isStairCased1);
    if (distance1 === 50)
        fillAirLocation.start = getLocation(distance, 50, isStairCased1);
    if (distance === "straight") {
        fillAirLocation.end.x = fillAirLocation.start.x + 12;
        fillAirLocation.end.y = fillAirLocation.start.y + 13;
        fillAirLocation.end.z = fillAirLocation.start.z + 9;
    }
    else {
        fillAirLocation.end.x = fillAirLocation.start.x + 13;
        fillAirLocation.end.y = fillAirLocation.start.y + 16;
        fillAirLocation.end.z = fillAirLocation.start.z + 10;
    }
    if (distance2 === 16)
        structurePlaceLocation = getLocation(distance, 16, isStairCased2);
    if (distance2 === 21)
        structurePlaceLocation = getLocation(distance, 21, isStairCased2);
    if (distance2 === 50)
        structurePlaceLocation = getLocation(distance, 50, isStairCased2);
    dimension.fillBlocks(new mc.BlockVolume(fillAirLocation.start, fillAirLocation.end), "minecraft:air");
    mc.world.structureManager.place(structure.file, dimension, structurePlaceLocation);
};
const handleDistanceChange = function (player, blocks) {
    if (tempData.gameID === "straightBridger") {
        if (dynamicProperty.getGameData(GameDataID.straightDistance) === blocks)
            return exp.confirmMessage(player, "§4The distance is already has been changed!", "random.anvil_land");
        fillAndPlace(data.structures[0], "straight", {
            distance: +dynamicProperty.getGameData(GameDataID.straightDistance),
            isStairCased: dynamicProperty.getGameData(GameDataID.straightIsStairCased),
        }, { distance: blocks, isStairCased: dynamicProperty.getGameData(GameDataID.straightIsStairCased) });
        dynamicProperty.setGameData(GameDataID.straightDistance, blocks);
        exp.setBridgerMode(`straight${blocks}b`);
        exp.confirmMessage(player, `§aThe distance is now§r §6${blocks} blocks§r§a!`, "random.orb");
        updateFloatingText();
    }
    else if (tempData.gameID === "inclinedBridger") {
        if (dynamicProperty.getGameData(GameDataID.inclinedDistance) === blocks)
            return exp.confirmMessage(player, "§4The distance is already has been changed!", "random.anvil_land");
        fillAndPlace(data.structures[1], "inclined", {
            distance: +dynamicProperty.getGameData(GameDataID.inclinedDistance),
            isStairCased: dynamicProperty.getGameData(GameDataID.inclinedIsStairCased),
        }, { distance: blocks, isStairCased: dynamicProperty.getGameData(GameDataID.inclinedIsStairCased) });
        dynamicProperty.setGameData(GameDataID.inclinedDistance, blocks);
        exp.setBridgerMode(`inclined${blocks}b`);
        exp.confirmMessage(player, `§aThe distance is now§r §6${blocks} blocks§r§a!`, "random.orb");
        updateFloatingText();
    }
};
const handleHeightChange = function (player, isStairCased) {
    if (tempData.gameID === "straightBridger") {
        if (dynamicProperty.getGameData(GameDataID.straightIsStairCased) === isStairCased)
            return exp.confirmMessage(player, "§4The height is already has been changed!", "random.anvil_land");
        fillAndPlace(data.structures[0], "straight", {
            distance: +dynamicProperty.getGameData(GameDataID.straightDistance),
            isStairCased: !isStairCased,
        }, {
            distance: +dynamicProperty.getGameData(GameDataID.straightDistance),
            isStairCased: isStairCased,
        });
        dynamicProperty.setGameData(GameDataID.straightIsStairCased, isStairCased);
        exp.confirmMessage(player, `§aThe height is now§r §6${isStairCased ? "StairCased" : "Flat"}§r§a!`, "random.orb");
    }
    else if (tempData.gameID === "inclinedBridger") {
        if (dynamicProperty.getGameData(GameDataID.inclinedIsStairCased) === isStairCased)
            return exp.confirmMessage(player, "§4The height is already has been changed!", "random.anvil_land");
        fillAndPlace(data.structures[1], "inclined", {
            distance: +dynamicProperty.getGameData(GameDataID.inclinedDistance),
            isStairCased: !isStairCased,
        }, {
            distance: +dynamicProperty.getGameData(GameDataID.inclinedDistance),
            isStairCased: isStairCased,
        });
        dynamicProperty.setGameData(GameDataID.inclinedIsStairCased, isStairCased);
        exp.confirmMessage(player, `§aThe height is now§r §6${isStairCased ? "StairCased" : "Flat"}§r§a!`, "random.orb");
    }
};
export const defineBridger = function (pl) {
    bridger.player = pl;
};
export const fetchData = function (dir) {
    Object.keys(tempBridgerData).map((data) => {
        const distance = dynamicProperty.getGameData(`${dir}Distance`);
        if (data === "auto:gameDatas") {
            const isStairCased = dynamicProperty.getGameData(`${dir}IsStairCased`);
            tempBridgerData["auto:gameDatas"] = [isStairCased, distance];
        }
        if (data === "auto:pb")
            tempBridgerData[data] = dynamicProperty.getPB(`${dir}${distance}b`);
        if (data === "auto:atmps")
            tempBridgerData[data] = dynamicProperty.getAttempts(`${dir}${distance}b`);
        if (data === "auto:successAtmps")
            tempBridgerData[data] = dynamicProperty.getSuccessAttempts(`${dir}${distance}b`);
    });
};
export const bridgerFormHandler = async function (player) {
    const game = tempData.bridgerMode;
    const { selection: bridgerSelection } = await form.bridgerForm(player);
    if (bridgerSelection === 10) {
        const { selection: islandSelection } = await form.bridgerIslandForm(player);
        if (islandSelection === 10)
            handleDistanceChange(player, 16);
        if (islandSelection === 19)
            handleDistanceChange(player, 21);
        if (islandSelection === 28)
            handleDistanceChange(player, 50);
        if (islandSelection === 12)
            handleHeightChange(player, true);
        if (islandSelection === 21)
            handleHeightChange(player, false);
    }
    if (bridgerSelection === 12) {
        const { selection: blockSelection } = await form.bridgerBlockForm(player);
        const blockObj = data.formBlocks[blockSelection - 9];
        tempData.blockBridger = blockObj.texture;
        exp.giveItems(player, data.getInvData("straightBridger"));
        exp.confirmMessage(player, `§aThe block has changed to§r §6${blockObj.blockName}§r§a!`, "random.orb");
    }
    if (bridgerSelection === 14) {
        const { selection: confirmSelection } = await confirmationForm(player);
        if (confirmSelection !== 15)
            return;
        dynamicProperty.resetPB(game);
        exp.confirmMessage(player, "§aSuccess! Your personal best score has been reset!", "random.orb");
        updateFloatingText();
    }
    if (bridgerSelection === 16) {
        exp.backToLobbyKit(player);
        resetMap(false);
    }
};
export const placingBlockEvt = function (block) {
    if (!bridger.blocks)
        bridger.timer = mc.system.runInterval(() => bridger.timer && bridger.ticks++);
    bridger.blocks++;
    bridger.storedLocations.push(block.location);
};
export const pressurePlatePushEvt = function () {
    if (bridger.plateDisabled)
        return;
    const game = tempData.bridgerMode;
    if (bridger.timer)
        mc.system.clearRun(bridger.timer);
    bridger.plateDisabled = true;
    bridger.autoReq = mc.system.runTimeout(enablePlate, 80);
    if (dynamicProperty.getPB(game) === -1 || bridger.ticks < dynamicProperty.getPB(game)) {
        dynamicProperty.setPB(game, bridger.ticks);
        showMessage(true);
    }
    else
        showMessage(false);
    dynamicProperty.addAttempts(game);
    dynamicProperty.addSuccessAttempts(game);
};
export const listener = function () {
    const game = tempData.bridgerMode;
    if (bridger.player.location.y <= 88) {
        if (bridger.plateDisabled)
            enablePlate(true);
        else {
            if (bridger.timer) {
                mc.system.clearRun(bridger.timer);
                bridger.timer = null;
            }
            dynamicProperty.addAttempts(game);
            resetMap();
        }
    }
    bridger.player.onScreenDisplay.setTitle(`      §b§lAUTO World§r\n§7-------------------§r\n §7- §6Personal Best:§r\n   ${dynamicProperty.getPB(game) === -1 ? "--.--" : tickToSec(dynamicProperty.getPB(game))}\n\n §7- §6Time:§r\n   ${tickToSec(bridger.ticks)}\n\n §7- §6Blocks:§r\n   ${bridger.blocks}\n§7-------------------§r\n §8§oVersion 4 | ${exp.today}`);
};
