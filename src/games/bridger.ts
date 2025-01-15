import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import * as data from "../utilities/staticData";
import * as form from "../forms/bridger";
import { confirmationForm } from "../forms/utility";

import dp from "../utilities/dynamicProperty";
import ts from "../utilities/tempStorage";
import TeleportationLocation from "../models/TeleportationLocation";
import { BridgerTicksID } from "../models/DynamicProperty";
import { DynamicPropertyID } from "../models/DynamicProperty";
import { VERSION } from "../utilities/staticData";

type Bridger = {
  storedLocations: mc.Vector3[];
  blocks: number;
  ticks: number;

  isPlateDisabled: boolean;
  timer?: number;
  autoReq?: number;
};

type IslandDistance = 16 | 21 | 50;

type FillAndPlaceIF = {
  distance: IslandDistance;
  isStairCased: boolean;
};

/////////////////////////////////////////////////////////
const bridger: Partial<Bridger> = {
  storedLocations: [],
  blocks: 0,
  ticks: 0,

  isPlateDisabled: false,
  timer: undefined, // interval
  autoReq: undefined, // timeOut
};

const BASE_LOCATION: Record<"straight" | "inclined", mc.Vector3> = {
  straight: { x: 9993, y: 93, z: 10003 },
  inclined: { x: 9970, y: 93, z: 10001 },
};

const HEIGHT_DIFF = {
  16: 1,
  21: 2,
  50: 5,
};

/////////////////////////////////////////////////////////
/**
 * takes the difference in ms and returns it in seconds (string format)
 */
const differenceMs = function (ms1: number, ms2: number): string {
  const difference = ms1 - ms2;
  if (difference === 0) return "±0.00";
  return difference < 0 ? `§c+${util.tickToSec(Math.abs(difference))}` : `§a-${util.tickToSec(difference)}`;
};

/**
 * shows the result of the bridging
 */
const showMessage = function (wasPB: boolean, prevPB?: number): void {
  const getMessage = (distance: number, pb: number, time: number, waspb = false) => {
    const baseMessage = `
§7----------------------------§r 
  §bBridger§r §8§o- Version ${VERSION}§r

  §6Distance:§r §f${distance} Blocks
  §6${waspb ? "Your Previous Best" : "Your Personal Best"}:§r §f${
      pb === -1 ? "--.--" : util.tickToSec(waspb ? prevPB : pb)
    }§f
  §6Time Recorded:§r §f${util.tickToSec(time)}§r ${
      pb !== -1 ? "§f(" + (wasPB ? differenceMs(prevPB, time) : differenceMs(pb, time)) + "§f)" : ""
    }§r`;

    const pbMessage = waspb ? `  §d§lNEW PERSONAL BEST!!§r\n` : "";
    return `${baseMessage}\n${pbMessage}§7----------------------------`;
  };
  const distance = +dp.getDynamicBridgerData(DynamicPropertyID.GameDatas, "Distance");
  const message = getMessage(distance, dp.getDynamicBridgerData(DynamicPropertyID.PB), bridger.ticks, wasPB);
  ts.getData("player").sendMessage(message);
};

/**
 * floating entity grabber
 */
const getFloatingEntity = function (): mc.Entity {
  switch (ts.getData("gameID")) {
    case "straightBridger":
      return mc.world
        .getDimension("overworld")
        .getEntities({ location: { x: 9997.2, y: 100.45, z: 10004.51 }, excludeFamilies: ["player"] })[0];
    case "inclinedBridger":
      return mc.world
        .getDimension("overworld")
        .getEntities({ location: { x: 9974.08, y: 100.0, z: 10002.96 }, excludeFamilies: ["player"] })[0];
  }
};

/**
 * sets a new average time
 */
const setAverageTime = function (newTime: number) {
  const prevAvgTime = dp.getDynamicBridgerData(DynamicPropertyID.AverageTime);
  const attempts = dp.getDynamicBridgerData(DynamicPropertyID.SuccessAttempts);
  const newAvgTime = prevAvgTime === -1 ? newTime : (prevAvgTime * attempts + newTime) / (attempts + 1);

  dp.setDynamicBridgerData(DynamicPropertyID.AverageTime, Math.round(newAvgTime * 100) / 100);
};

/**
 * updates the floating texts including stats about the player
 */
const updateFloatingText = function () {
  const pbData = dp.getDynamicBridgerData(DynamicPropertyID.PB);
  const avgTimeData = dp.getDynamicBridgerData(DynamicPropertyID.AverageTime);
  const info = {
    pb: pbData === -1 ? "--.--" : util.tickToSec(pbData),
    avgTime: avgTimeData === -1 ? "--.--" : util.tickToSec(avgTimeData),
    attempts: dp.getDynamicBridgerData(DynamicPropertyID.Attempts),
    successAttempts: dp.getDynamicBridgerData(DynamicPropertyID.SuccessAttempts),
  };
  const distance = dp.getDynamicBridgerData(DynamicPropertyID.GameDatas, "Distance");

  const displayText = `§b${ts.getData("player").nameTag}§r §7-§r §o§7${distance} blocks§r
§6Personal Best:§r §f${info.pb}§r
§6Average Time:§r §f${info.avgTime}§r
§6Bridging Attempts:§r §f${info.attempts}§r
§6Successful Attempts:§r §f${info.successAttempts}§r`;

  getFloatingEntity().nameTag = displayText;
};

/**
 * reset bridger data
 */
const resetBridger = function (): void {
  bridger.blocks = 0;
  bridger.ticks = 0;
  bridger.storedLocations = [];
};

/**
 * resets the map (clearing temp data, blocks, and teleporting)
 */
const resetMap = function (wasAttempt: boolean = true): void {
  const gameId = ts.getData("gameID");

  // teleport player
  wasAttempt
    ? util.teleportation(ts.getData("player"), <TeleportationLocation>data.locationData[gameId])
    : util.teleportation(ts.getData("player"), <TeleportationLocation>data.locationData.lobby);

  // update floating text
  if (wasAttempt) updateFloatingText();

  // clear bridged blocks
  if (bridger.storedLocations.length)
    bridger.storedLocations.map((location) =>
      mc.world.getDimension("overworld").setBlockType(location, "minecraft:air")
    );

  // reset blocks and ticks
  resetBridger();
};

/**
 * re-enable pressure plate (disabled temp when plate is pressed)
 * @param {Boolean} cancelTimer - whether canceling timer to resetMap is necessary or not
 */
const enablePlate = function (cancelTimer: boolean = false): void {
  bridger.isPlateDisabled = false;
  if (cancelTimer) mc.system.clearRun(bridger.autoReq);
  resetMap();
  util.giveItems("straightBridger");
};

const stopTimer = function () {
  if (!bridger.timer) return;
  mc.system.clearRun(bridger.timer);
  bridger.timer = null;
};

const isPB = function (): boolean {
  return (
    dp.getDynamicBridgerData(DynamicPropertyID.PB) === -1 ||
    bridger.ticks < dp.getDynamicBridgerData(DynamicPropertyID.PB)
  );
};

/**
 * gets the location (start fill, end fill, structure place) based on distance
 * @returns {mc.Vector3}
 */
const getLocation = function (direction: "straight" | "inclined", distance: number, isStairCased: boolean): mc.Vector3 {
  const baseLocation: mc.Vector3 = BASE_LOCATION[direction];
  return {
    x: direction === "straight" ? baseLocation.x : baseLocation.x - distance,
    y: isStairCased ? baseLocation.y + HEIGHT_DIFF[distance] : baseLocation.y,
    z: baseLocation.z + distance,
  };
};

/**
 * clear previous island and place new island at new location
 * @param {Object} info which filled with air
 * @param {Object} info which new structure will be built
 */
const fillAndPlace = function (
  structure,
  distance: "straight" | "inclined",
  { distance: distance1, isStairCased: isStairCased1 }: FillAndPlaceIF,
  { distance: distance2, isStairCased: isStairCased2 }: FillAndPlaceIF
) {
  const dimension = mc.world.getDimension("overworld");
  const fillAirLocation = {
    start: { x: undefined, y: undefined, z: undefined },
    end: { x: undefined, y: undefined, z: undefined },
  };
  let structurePlaceLocation = { x: undefined, y: undefined, z: undefined };

  if (distance1 === 16) fillAirLocation.start = getLocation(distance, 16, isStairCased1);
  if (distance1 === 21) fillAirLocation.start = getLocation(distance, 21, isStairCased1);
  if (distance1 === 50) fillAirLocation.start = getLocation(distance, 50, isStairCased1);

  if (distance === "straight") {
    fillAirLocation.end.x = fillAirLocation.start.x + 12;
    fillAirLocation.end.y = fillAirLocation.start.y + 13;
    fillAirLocation.end.z = fillAirLocation.start.z + 9;
  } else {
    fillAirLocation.end.x = fillAirLocation.start.x + 13;
    fillAirLocation.end.y = fillAirLocation.start.y + 16;
    fillAirLocation.end.z = fillAirLocation.start.z + 10;
  }

  if (distance2 === 16) structurePlaceLocation = getLocation(distance, 16, isStairCased2);
  if (distance2 === 21) structurePlaceLocation = getLocation(distance, 21, isStairCased2);
  if (distance2 === 50) structurePlaceLocation = getLocation(distance, 50, isStairCased2);

  dimension.fillBlocks(new mc.BlockVolume(fillAirLocation.start, fillAirLocation.end), "minecraft:air");
  mc.world.structureManager.place(structure, dimension, structurePlaceLocation);
};

/**
 * replace island based on distance and save in dynamic property
 */
const handleDistanceChange = function (player: mc.Player, blocks: IslandDistance): void {
  // check whether player clicked on the same distance
  if (dp.getDynamicBridgerData(DynamicPropertyID.GameDatas, "Distance") === blocks)
    return util.confirmMessage(player, "§4The distance is already has been changed!", "random.anvil_land");

  fillAndPlace(
    data.structures[ts.getData("bridgerDirection")],
    ts.getData("bridgerDirection"),
    {
      distance: <IslandDistance>dp.getDynamicBridgerData(DynamicPropertyID.GameDatas, "Distance"),
      isStairCased: <boolean>dp.getDynamicBridgerData(DynamicPropertyID.GameDatas, "IsStairCased"),
    },
    {
      distance: blocks,
      isStairCased: <boolean>dp.getDynamicBridgerData(DynamicPropertyID.GameDatas, "IsStairCased"),
    }
  );

  // set distance as dynamic property, set bridger mode for temp data
  dp.setDynamicBridgerData(DynamicPropertyID.GameDatas, blocks, "Distance");
  util.setBridgerMode(<BridgerTicksID>`${ts.getData("bridgerDirection")}${blocks}b`);

  util.confirmMessage(player, `§aThe distance is now§r §6${blocks} blocks§r§a!`, "random.orb");
  updateFloatingText();
};

/**
 * replace island based on height and save in dynamic property
 */
const handleHeightChange = function (player: mc.Player, isStairCased: boolean): void {
  // check whether player clicked on the same distance
  if (<boolean>dp.getDynamicBridgerData(DynamicPropertyID.GameDatas, "IsStairCased") === isStairCased)
    return util.confirmMessage(player, "§4The height is already has been changed!", "random.anvil_land");

  fillAndPlace(
    data.structures[ts.getData("bridgerDirection")],
    ts.getData("bridgerDirection"),
    {
      distance: <IslandDistance>dp.getDynamicBridgerData(DynamicPropertyID.GameDatas, "Distance"),
      isStairCased: !isStairCased,
    },
    {
      distance: <IslandDistance>dp.getDynamicBridgerData(DynamicPropertyID.GameDatas, "Distance"),
      isStairCased: isStairCased,
    }
  );

  // set staircased as dynamic property
  dp.setDynamicBridgerData(DynamicPropertyID.GameDatas, isStairCased, "IsStairCased");

  util.confirmMessage(player, `§aThe height is now§r §6${isStairCased ? "StairCased" : "Flat"}§r§a!`, "random.orb");
};

/////////////////////////////////////////////////////////
export const bridgerFormHandler = async function (player: mc.Player) {
  const { selection: bridgerSelection } = await form.bridgerForm(player);

  // general
  if (bridgerSelection === 10) {
    const { selection: islandSelection } = await form.bridgerIslandForm(player);

    if (islandSelection === 10) handleDistanceChange(player, 16);
    if (islandSelection === 19) handleDistanceChange(player, 21);
    if (islandSelection === 28) handleDistanceChange(player, 50);
    if (islandSelection === 12) handleHeightChange(player, true);
    if (islandSelection === 21) handleHeightChange(player, false);
  }

  // block
  if (bridgerSelection === 12) {
    const { selection: blockSelection } = await form.bridgerBlockForm(player);
    const blockObj = data.formBlocks[blockSelection - 9];

    ts.setData("blockBridger", blockObj.texture);
    util.giveItems(`straightBridger`);
    util.confirmMessage(player, `§aThe block has changed to§r §6${blockObj.blockName}§r§a!`, "random.orb");
  }

  // reset pb
  if (bridgerSelection === 14) {
    const { selection: confirmSelection } = await confirmationForm(player);
    if (confirmSelection !== 15) return;
    dp.resetDynamicBridgerData(DynamicPropertyID.PB);
    util.confirmMessage(player, "§aSuccess! Your personal best score has been reset!", "random.orb");
    updateFloatingText();
  }

  // quit bridger
  if (bridgerSelection === 16) {
    dp.postData();
    resetMap(false);
    util.backToLobbyKit(player);
  }
};

export const placingBlockEvt = function (block: mc.Block) {
  if (!bridger.blocks && !bridger.timer) bridger.timer = mc.system.runInterval(() => bridger.timer && bridger.ticks++);

  bridger.blocks++;
  bridger.storedLocations.push(block.location);
};

export const pressurePlatePushEvt = function (player: mc.Player) {
  if (bridger.isPlateDisabled) return;
  bridger.isPlateDisabled = true;

  stopTimer();

  player.onScreenDisplay.setTitle(`§6Time§7: §f${util.tickToSec(bridger.ticks)}§r`);

  if (isPB()) {
    dp.setDynamicBridgerData(DynamicPropertyID.PB, bridger.ticks);
    showMessage(true, dp.getDynamicBridgerData(DynamicPropertyID.PB));
    player.playSound("random.levelup");
    player.onScreenDisplay.updateSubtitle("§dNEW RECORD!!!");
  } else showMessage(false);

  setAverageTime(bridger.ticks);

  mc.world.getDimension("overworld").spawnEntity("fireworks_rocket", player.location);
  bridger.autoReq = mc.system.runTimeout(enablePlate, 80);

  dp.addDynamicBridgerData(DynamicPropertyID.Attempts);
  dp.addDynamicBridgerData(DynamicPropertyID.SuccessAttempts);
};

export const listener = function () {
  ts.getData("player").onScreenDisplay.setActionBar(
    `      §b§lAUTO World§r\n§7-------------------§r\n §7- §6Personal Best:§r\n   ${
      dp.getDynamicBridgerData(DynamicPropertyID.PB) === -1
        ? "--.--"
        : util.tickToSec(dp.getDynamicBridgerData(DynamicPropertyID.PB))
    }\n\n §7- §6Time:§r\n   ${util.tickToSec(bridger.ticks)}\n\n §7- §6Blocks:§r\n   ${
      bridger.blocks
    }\n§7-------------------§r\n §8§oVersion ${VERSION} | ${util.today}`
  );

  if (!(ts.getData("player").location.y <= 95)) return;
  if (bridger.isPlateDisabled) enablePlate(true);
  else {
    stopTimer();
    resetMap();
    util.giveItems("straightBridger");
    dp.addDynamicBridgerData(DynamicPropertyID.Attempts);
  }
};

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
mc.world.afterEvents.chatSend.subscribe(({ sender: player }) => {
  player.sendMessage("player defined");
  //////////////////////////////////////////////////
  // make sure to go back to lobby before reloading
  // debug from here
  ts.setData("player", player);
});
