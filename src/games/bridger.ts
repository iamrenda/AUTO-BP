import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import * as data from "../data/staticData";
import * as form from "../forms/bridger";
import TeleportationLocation from "../models/TeleportationLocation";
import { bridgerTs } from "../data/tempStorage";
import { confirmationForm } from "../forms/utility";
import { BridgerTicksID } from "../models/DynamicProperty";
import { DynamicPropertyID } from "../models/DynamicProperty";
import { VERSION } from "../data/staticData";
import { BridgerData, DynamicProperty, GameData } from "../data/dynamicProperty";

type IslandDistance = 16 | 21 | 50;

type FillAndPlaceIF = {
  distance: IslandDistance;
  isStairCased: boolean;
};
/////////////////////////////////////////////////////////

const BASE_LOCATION: Record<"straight" | "inclined", mc.Vector3> = {
  straight: { x: 9993, y: 93, z: 10003 },
  inclined: { x: 9970, y: 93, z: 10001 },
};

const HEIGHT_DIFF: Record<number, number> = {
  16: 1,
  21: 2,
  50: 5,
};

/////////////////////////////////////////////////////////
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
      pb !== -1 ? "§f(" + (wasPB ? util.differenceMs(prevPB, time) : util.differenceMs(pb, time)) + "§f)" : ""
    }§r`;

    const pbMessage = waspb ? `  §d§lNEW PERSONAL BEST!!§r\n` : "";
    return `${baseMessage}\n${pbMessage}§7----------------------------`;
  };
  const distance = GameData.getData("Distance");
  const pb = BridgerData.getData(DynamicPropertyID.Bridger_PB);
  const message = getMessage(distance, pb, bridgerTs.commonData["ticks"], wasPB);
  bridgerTs.commonData["player"].sendMessage(message);
};

/**
 * sets a new average time for dynamic property
 */
const setAverageTime = function (newTime: number) {
  const prevAvgTime = BridgerData.getData(DynamicPropertyID.Bridger_AverageTime);
  const attempts = BridgerData.getData(DynamicPropertyID.Bridger_Attempts);
  const newAvgTime = prevAvgTime === -1 ? newTime : (prevAvgTime * attempts + newTime) / (attempts + 1);

  BridgerData.setData(DynamicPropertyID.Bridger_AverageTime, Math.round(newAvgTime * 100) / 100);
};

/**
 * updates the floating texts including stats about the player
 */
const updateFloatingText = function () {
  const pbData = BridgerData.getData(DynamicPropertyID.Bridger_PB);
  const avgTimeData = BridgerData.getData(DynamicPropertyID.Bridger_AverageTime);
  const info = {
    pb: pbData === -1 ? "--.--" : util.tickToSec(pbData),
    avgTime: avgTimeData === -1 ? "--.--" : util.tickToSec(avgTimeData),
    attempts: BridgerData.getData(DynamicPropertyID.Bridger_Attempts),
    successAttempts: BridgerData.getData(DynamicPropertyID.Bridger_SuccessAttempts),
  };
  const distance = GameData.getData("Distance");

  const displayText = `§b${bridgerTs.commonData["player"].nameTag}§r §7-§r §o§7${distance} blocks§r
§6Personal Best:§r §f${info.pb}§r
§6Average Time:§r §f${info.avgTime}§r
§6Bridging Attempts:§r §f${info.attempts}§r
§6Successful Attempts:§r §f${info.successAttempts}§r`;

  util.getFloatingEntity().nameTag = displayText;
};

/**
 * reset bridger data
 */
const resetBridger = function (): void {
  bridgerTs.commonData["blocks"] = 0;
  bridgerTs.commonData["ticks"] = 0;
};

/**
 * resets the map (clearing temp data, blocks, and teleporting)
 */
const resetMap = function (wasAttempt: boolean = true): void {
  const gameId = bridgerTs.commonData["gameID"];

  wasAttempt
    ? util.teleportation(<TeleportationLocation>data.locationData[gameId])
    : util.teleportation(<TeleportationLocation>data.locationData.lobby);

  if (wasAttempt) updateFloatingText();

  bridgerTs.clearBlocks();

  resetBridger();
};

/**
 * re-enable pressure plate (disabled temp when plate is pressed)
 * @param {Boolean} cancelTimer - whether canceling timer to resetMap is necessary or not
 */
const enablePlate = function (cancelTimer: boolean = false): void {
  bridgerTs.tempData["isPlateDisabled"] = false;
  if (cancelTimer) mc.system.clearRun(bridgerTs.tempData["autoReq"]);
  resetMap();
  util.giveItems("straightBridger");
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
  structure: string,
  distance: "straight" | "inclined",
  { distance: distance1, isStairCased: isStairCased1 }: FillAndPlaceIF,
  { distance: distance2, isStairCased: isStairCased2 }: FillAndPlaceIF
) {
  const dimension = mc.world.getDimension("overworld");
  const fillAirLocation: Record<string, mc.Vector3> = {
    start: { x: undefined, y: undefined, z: undefined },
    end: { x: undefined, y: undefined, z: undefined },
  };
  let structurePlaceLocation: mc.Vector3 = { x: undefined, y: undefined, z: undefined };

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
const handleDistanceChange = function (blocks: IslandDistance): void {
  // check whether player clicked on the same distance
  if (GameData.getData("Distance") === blocks)
    return util.confirmMessage("§4The distance is already has been changed!", "random.anvil_land");

  fillAndPlace(
    data.structures[bridgerTs.tempData["bridgerDirection"]],
    bridgerTs.tempData["bridgerDirection"],
    {
      distance: GameData.getData("Distance"),
      isStairCased: GameData.getData("IsStairCased"),
    },
    {
      distance: blocks,
      isStairCased: GameData.getData("IsStairCased"),
    }
  );

  // set distance as dynamic property, set bridger mode for temp data
  GameData.setData("Distance", blocks);
  util.setBridgerMode(<BridgerTicksID>`${bridgerTs.tempData["bridgerDirection"]}${blocks}b`);

  util.confirmMessage(`§aThe distance is now§r §6${blocks} blocks§r§a!`, "random.orb");
  updateFloatingText();
};

/**
 * replace island based on height and save in dynamic property
 */
const handleHeightChange = function (isStairCased: boolean): void {
  // check whether player clicked on the same distance
  if (GameData.getData("IsStairCased") === isStairCased)
    return util.confirmMessage("§4The height is already has been changed!", "random.anvil_land");

  fillAndPlace(
    data.structures[bridgerTs.tempData["bridgerDirection"]],
    bridgerTs.tempData["bridgerDirection"],
    {
      distance: GameData.getData("Distance"),
      isStairCased: !isStairCased,
    },
    {
      distance: GameData.getData("Distance"),
      isStairCased: isStairCased,
    }
  );

  // set staircased as dynamic property
  GameData.setData("IsStairCased", isStairCased);

  util.confirmMessage(`§aThe height is now§r §6${isStairCased ? "StairCased" : "Flat"}§r§a!`, "random.orb");
};

/////////////////////////////////////////////////////////
export const bridgerFormHandler = async function (player: mc.Player) {
  const { selection: bridgerSelection } = await form.bridgerForm(player);

  // general
  if (bridgerSelection === 10) {
    const { selection: islandSelection } = await form.bridgerIslandForm(player);

    if (islandSelection === 10) handleDistanceChange(16);
    if (islandSelection === 19) handleDistanceChange(21);
    if (islandSelection === 28) handleDistanceChange(50);
    if (islandSelection === 12) handleHeightChange(true);
    if (islandSelection === 21) handleHeightChange(false);
  }

  // block
  if (bridgerSelection === 12) {
    const { selection: blockSelection } = await form.bridgerBlockForm(player);
    const blockObj = data.formBlocks[blockSelection - 9];

    bridgerTs.tempData["blockBridger"] = blockObj.texture;
    util.giveItems(`straightBridger`);
    util.confirmMessage(`§aThe block has changed to§r §6${blockObj.blockName}§r§a!`, "random.orb");
  }

  // reset pb
  if (bridgerSelection === 14) {
    const distance = GameData.getData("Distance");
    const { selection: confirmSelection } = await confirmationForm(player, `${distance} blocks`);
    if (confirmSelection !== 15) return;

    BridgerData.setData(DynamicPropertyID.Bridger_PB, -1);
    util.confirmMessage("§aSuccess! Your personal best score has been reset!", "random.orb");
    updateFloatingText();
  }

  // quit bridger
  if (bridgerSelection === 16) {
    DynamicProperty.postData();
    resetMap(false);
    util.backToLobbyKit();
  }
};

export const placingBlockEvt = function (block: mc.Block) {
  if (!bridgerTs.commonData["blocks"] && !bridgerTs.commonData["timer"])
    bridgerTs.commonData["timer"] = mc.system.runInterval(
      () => bridgerTs.commonData["timer"] && bridgerTs.commonData["ticks"]++
    );

  bridgerTs.commonData["blocks"]++;
  bridgerTs.commonData["storedLocations"].add(block.location);
};

export const pressurePlatePushEvt = function (player: mc.Player) {
  if (bridgerTs.tempData["isPlateDisabled"]) return;
  const ticks = bridgerTs.commonData["ticks"];

  bridgerTs.tempData["isPlateDisabled"] = true;

  bridgerTs.stopTimer();

  player.onScreenDisplay.setTitle(`§6Time§7: §f${util.tickToSec(ticks)}§r`);

  if (util.isPB(BridgerData.getData(DynamicPropertyID.Bridger_PB), ticks)) {
    BridgerData.setData(DynamicPropertyID.Bridger_PB, ticks);
    showMessage(true, BridgerData.getData(DynamicPropertyID.Bridger_PB));
    player.playSound("random.levelup");
    player.onScreenDisplay.updateSubtitle("§dNEW RECORD!!!");
  } else showMessage(false);

  setAverageTime(ticks);

  mc.world.getDimension("overworld").spawnEntity("fireworks_rocket", player.location);
  bridgerTs.tempData["autoReq"] = mc.system.runTimeout(enablePlate, 80);

  BridgerData.addData(DynamicPropertyID.Bridger_Attempts);
  BridgerData.addData(DynamicPropertyID.Bridger_SuccessAttempts);
};

export const listener = function () {
  util.displayScoreboard("straightBridger");

  if (!(bridgerTs.commonData["player"].location.y <= 95)) return;
  if (bridgerTs.tempData["isPlateDisabled"]) enablePlate(true);
  else {
    bridgerTs.stopTimer();
    BridgerData.addData(DynamicPropertyID.Bridger_Attempts);
    util.giveItems("straightBridger");
    resetMap();
  }
};
