import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import * as data from "../utilities/staticData";
import * as form from "forms/bridger";
import { confirmationForm } from "forms/utility";
import DynamicProperty from "../utilities/dynamicProperty";
import { BridgerTicksID } from "models/DynamicProperty";
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
const BASE_LOCATION = {
    straight: { x: 9993, y: 93, z: 10003 },
    inclined: { x: 9970, y: 93, z: 10001 },
};
const HEIGHT_DIFF = {
    16: 1,
    21: 2,
    50: 5,
};
const showMessage = function (wasPB) {
    const getMessage = (distance, pb, time, newPB = false) => `§7----------------------------§r
   §bBridger§r §8§o- Version 4§r

   §6Distance:§r §f${distance} Blocks
   §6Your Personal Best:§r §f${pb === -1 ? "--.--" : util.tickToSec(pb)}§f
   §6Time Recorded:§r §f${util.tickToSec(time)}§r
   ${newPB ? "§d§lNEW PERSONAL BEST!!§r\n" : ""}
§7----------------------------`;
    const distance = +DynamicProperty.getDynamicBridgerData(DynamicPropertyID.GameDatas, "Distance");
    const message = getMessage(distance, DynamicProperty.getDynamicBridgerData(DynamicPropertyID.PB), bridger.ticks, wasPB);
    bridger.player.sendMessage(message);
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
    const pbData = DynamicProperty.getDynamicBridgerData(DynamicPropertyID.PB);
    const info = {
        pb: pbData === -1 ? "--.--" : util.tickToSec(pbData),
        attempts: DynamicProperty.getDynamicBridgerData(DynamicPropertyID.Attempts),
        successAttempts: DynamicProperty.getDynamicBridgerData(DynamicPropertyID.SuccessAttempts),
    };
    const successFailRatio = (info.successAttempts / info.attempts).toFixed(2);
    const distance = DynamicProperty.getDynamicBridgerData(DynamicPropertyID.GameDatas, "Distance");
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
    wasAttempt
        ? util.teleportation(bridger.player, data.locationData[gameId])
        : util.teleportation(bridger.player, data.locationData.lobby);
};
const enablePlate = function (cancelTimer = false) {
    bridger.plateDisabled = false;
    if (cancelTimer)
        mc.system.clearRun(bridger.autoReq);
    resetMap();
    util.giveItems(bridger.player, data.getInvData(tempData.gameID));
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
    if (DynamicProperty.getDynamicBridgerData(DynamicPropertyID.GameDatas, "Distance") === blocks)
        return util.confirmMessage(player, "§4The distance is already has been changed!", "random.anvil_land");
    fillAndPlace(data.structures[0], tempData.bridgerDirection, {
        distance: DynamicProperty.getDynamicBridgerData(DynamicPropertyID.GameDatas, "Distance"),
        isStairCased: DynamicProperty.getDynamicBridgerData(DynamicPropertyID.GameDatas, "IsStairCased"),
    }, {
        distance: blocks,
        isStairCased: DynamicProperty.getDynamicBridgerData(DynamicPropertyID.GameDatas, "IsStairCased"),
    });
    DynamicProperty.setDynamicBridgerData(DynamicPropertyID.GameDatas, blocks, "Distance");
    util.setBridgerMode(`${tempData.bridgerDirection}${blocks}b`);
    util.confirmMessage(player, `§aThe distance is now§r §6${blocks} blocks§r§a!`, "random.orb");
    updateFloatingText();
};
const handleHeightChange = function (player, isStairCased) {
    if (DynamicProperty.getDynamicBridgerData(DynamicPropertyID.GameDatas, "IsStairCased") === isStairCased)
        return util.confirmMessage(player, "§4The height is already has been changed!", "random.anvil_land");
    fillAndPlace(data.structures[0], tempData.bridgerDirection, {
        distance: DynamicProperty.getDynamicBridgerData(DynamicPropertyID.GameDatas, "Distance"),
        isStairCased: !isStairCased,
    }, {
        distance: DynamicProperty.getDynamicBridgerData(DynamicPropertyID.GameDatas, "Distance"),
        isStairCased: isStairCased,
    });
    DynamicProperty.setDynamicBridgerData(DynamicPropertyID.GameDatas, isStairCased, "IsStairCased");
    util.confirmMessage(player, `§aThe height is now§r §6${isStairCased ? "StairCased" : "Flat"}§r§a!`, "random.orb");
};
export const bridgerHandler = function (player, game) {
    tempData.gameID = game;
    tempData.bridgerDirection = game === "straightBridger" ? "straight" : "inclined";
    DynamicProperty.fetchData();
    defineBridger(player);
    util.setBridgerMode(BridgerTicksID[`${tempData.bridgerDirection}16blocks`]);
    util.giveItems(player, data.getInvData(game));
    util.teleportation(player, data.locationData[game]);
    util.confirmMessage(player, "§7Teleporting to bridger...");
    updateFloatingText();
};
export const defineBridger = function (pl) {
    bridger.player = pl;
};
export const bridgerFormHandler = async function (player) {
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
        util.giveItems(player, data.getInvData("straightBridger"));
        util.confirmMessage(player, `§aThe block has changed to§r §6${blockObj.blockName}§r§a!`, "random.orb");
    }
    if (bridgerSelection === 14) {
        const { selection: confirmSelection } = await confirmationForm(player);
        if (confirmSelection !== 15)
            return;
        DynamicProperty.resetDynamicBridgerData(DynamicPropertyID.PB);
        util.confirmMessage(player, "§aSuccess! Your personal best score has been reset!", "random.orb");
        updateFloatingText();
    }
    if (bridgerSelection === 16) {
        await DynamicProperty.postData();
        resetMap(false);
        util.backToLobbyKit(player);
    }
};
export const placingBlockEvt = function (block) {
    if (!bridger.blocks && !bridger.timer)
        bridger.timer = mc.system.runInterval(() => bridger.ticks++);
    bridger.blocks++;
    bridger.storedLocations.push(block.location);
};
export const pressurePlatePushEvt = function () {
    if (bridger.plateDisabled)
        return;
    if (bridger.timer) {
        mc.system.clearRun(bridger.timer);
        bridger.timer = null;
    }
    bridger.plateDisabled = true;
    bridger.autoReq = mc.system.runTimeout(enablePlate, 80);
    if (DynamicProperty.getDynamicBridgerData(DynamicPropertyID.PB) === -1 ||
        bridger.ticks < DynamicProperty.getDynamicBridgerData(DynamicPropertyID.PB)) {
        DynamicProperty.setDynamicBridgerData(DynamicPropertyID.PB, bridger.ticks);
        showMessage(true);
    }
    else
        showMessage(false);
    DynamicProperty.addDynamicBridgerData(DynamicPropertyID.Attempts);
    DynamicProperty.addDynamicBridgerData(DynamicPropertyID.SuccessAttempts);
};
export const listener = function () {
    if (bridger.player.location.y <= 88) {
        if (bridger.plateDisabled)
            enablePlate(true);
        else {
            if (bridger.timer) {
                mc.system.clearRun(bridger.timer);
                bridger.timer = null;
            }
            DynamicProperty.addDynamicBridgerData(DynamicPropertyID.Attempts);
            resetMap();
            util.giveItems(bridger.player, data.getInvData(tempData.gameID));
        }
    }
    const pb = DynamicProperty.getDynamicBridgerData(DynamicPropertyID.PB);
    bridger.player.onScreenDisplay.setTitle(`      §b§lAUTO World§r\n§7-------------------§r\n §7- §6Personal Best:§r\n   ${pb === -1 ? "--.--" : util.tickToSec(pb)}\n\n §7- §6Time:§r\n   ${util.tickToSec(bridger.ticks)}\n\n §7- §6Blocks:§r\n   ${bridger.blocks}\n§7-------------------§r\n §8§oVersion 4 | ${util.today}`);
};
mc.world.afterEvents.chatSend.subscribe(({ sender: player }) => {
    bridger.player = player;
    player.sendMessage("player now defined");
    mc.world.sendMessage(util.getProperty(DynamicPropertyID.GameDatas));
    mc.world.sendMessage(util.getProperty(DynamicPropertyID.PB));
    mc.world.sendMessage(util.getProperty(DynamicPropertyID.Attempts));
    mc.world.sendMessage(util.getProperty(DynamicPropertyID.SuccessAttempts));
});
