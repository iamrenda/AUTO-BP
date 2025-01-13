import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import * as data from "../utilities/staticData";
import * as form from "forms/bridger";
import { confirmationForm } from "forms/utility";

import DynamicProperty from "../utilities/dynamicProperty";
import { BridgerTicksID } from "models/DynamicProperty";
import TeleportationLocation from "models/TeleportationLocation";
import tempData from "utilities/tempData";
import { DynamicPropertyID } from "models/DynamicProperty";
import GameID from "models/GameID";

type Bridger = {
  player: mc.Player;
  storedLocations: mc.Vector3[];
  blocks: number;
  ticks: number;

  plateDisabled: boolean;
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
  player: undefined,

  storedLocations: [],
  blocks: 0,
  ticks: 0,

  plateDisabled: false,
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
 * shows the result of the bridging
 */
const showMessage = function (wasPB: boolean): void {
  const getMessage = (distance: number, pb: number, time: number, newPB = false) => `§7----------------------------§r
   §bBridger§r §8§o- Version 4§r

   §6Distance:§r §f${distance} Blocks
   §6Your Personal Best:§r §f${pb === -1 ? "--.--" : util.tickToSec(pb)}§f
   §6Time Recorded:§r §f${util.tickToSec(time)}§r
   ${newPB ? "§d§lNEW PERSONAL BEST!!§r\n" : ""}
§7----------------------------`;

  const distance = +DynamicProperty.getDynamicBridgerData(DynamicPropertyID.GameDatas, "Distance");
  // const distance = tempBridgerDynamicData[DynamicPropertyID.GameDatas][1];
  const message = getMessage(
    distance,
    DynamicProperty.getDynamicBridgerData(DynamicPropertyID.PB),
    bridger.ticks,
    wasPB
  );
  bridger.player.sendMessage(message);
};

/**
 * floating entity grabber
 */
const floatingEntity = function (): mc.Entity {
  switch (tempData.gameID) {
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
 * updates the floating texts including stats about the player
 */
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

/**
 * reset bridger data
 */
const resetBridgerData = function (): void {
  bridger.blocks = 0;
  bridger.ticks = 0;
  bridger.storedLocations = [];
};

/**
 * resets the map (clearing temp data, blocks, and teleporting)
 */
const resetMap = function (wasAttempt: boolean = true): void {
  const gameId = tempData.gameID;

  // teleport player
  wasAttempt
    ? util.teleportation(bridger.player, <TeleportationLocation>data.locationData[gameId])
    : util.teleportation(bridger.player, <TeleportationLocation>data.locationData.lobby);

  // update floating text
  if (wasAttempt) updateFloatingText();

  // clear bridged blocks
  if (bridger.storedLocations.length)
    bridger.storedLocations.map((location) =>
      mc.world.getDimension("overworld").setBlockType(location, "minecraft:air")
    );

  // reset blocks and ticks
  resetBridgerData();
};

/**
 * re-enable pressure plate (disabled temp when plate is pressed)
 * @param {Boolean} cancelTimer - whether canceling timer to resetMap is necessary or not
 */
const enablePlate = function (cancelTimer: boolean = false): void {
  bridger.plateDisabled = false;
  if (cancelTimer) mc.system.clearRun(bridger.autoReq);
  resetMap();
  util.giveItems(bridger.player, data.getInvData(tempData.gameID));
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
  if (DynamicProperty.getDynamicBridgerData(DynamicPropertyID.GameDatas, "Distance") === blocks)
    return util.confirmMessage(player, "§4The distance is already has been changed!", "random.anvil_land");

  fillAndPlace(
    data.structures[tempData.bridgerDirection],
    tempData.bridgerDirection,
    {
      distance: <IslandDistance>DynamicProperty.getDynamicBridgerData(DynamicPropertyID.GameDatas, "Distance"),
      isStairCased: <boolean>DynamicProperty.getDynamicBridgerData(DynamicPropertyID.GameDatas, "IsStairCased"),
    },
    {
      distance: blocks,
      isStairCased: <boolean>DynamicProperty.getDynamicBridgerData(DynamicPropertyID.GameDatas, "IsStairCased"),
    }
  );

  // set distance as dynamic property, set bridger mode for temp data
  DynamicProperty.setDynamicBridgerData(DynamicPropertyID.GameDatas, blocks, "Distance");
  util.setBridgerMode(<BridgerTicksID>`${tempData.bridgerDirection}${blocks}b`);

  util.confirmMessage(player, `§aThe distance is now§r §6${blocks} blocks§r§a!`, "random.orb");
  updateFloatingText();
};

/**
 * replace island based on height and save in dynamic property
 */
const handleHeightChange = function (player: mc.Player, isStairCased: boolean): void {
  // check whether player clicked on the same distance
  if (<boolean>DynamicProperty.getDynamicBridgerData(DynamicPropertyID.GameDatas, "IsStairCased") === isStairCased)
    return util.confirmMessage(player, "§4The height is already has been changed!", "random.anvil_land");

  fillAndPlace(
    data.structures[tempData.bridgerDirection],
    tempData.bridgerDirection,
    {
      distance: <IslandDistance>DynamicProperty.getDynamicBridgerData(DynamicPropertyID.GameDatas, "Distance"),
      isStairCased: !isStairCased,
    },
    {
      distance: <IslandDistance>DynamicProperty.getDynamicBridgerData(DynamicPropertyID.GameDatas, "Distance"),
      isStairCased: isStairCased,
    }
  );

  // set staircased as dynamic property
  DynamicProperty.setDynamicBridgerData(DynamicPropertyID.GameDatas, isStairCased, "IsStairCased");

  util.confirmMessage(player, `§aThe height is now§r §6${isStairCased ? "StairCased" : "Flat"}§r§a!`, "random.orb");
};

/////////////////////////////////////////////////////////
/**
 * when player joins bridger from lobby
 */
export const bridgerHandler = async function (player: mc.Player, game: GameID) {
  util.confirmMessage(player, "§7Teleporting to bridger...");
  util.teleportation(player, <TeleportationLocation>data.locationData[game]);
  tempData.gameID = game;
  tempData.bridgerDirection = game === "straightBridger" ? "straight" : "inclined";
  defineBridger(player);
  DynamicProperty.fetchData();
  util.setBridgerMode(BridgerTicksID[`${tempData.bridgerDirection}16blocks`]);
  util.giveItems(player, data.getInvData(game));
};

export const defineBridger = function (pl: mc.Player) {
  bridger.player = pl;
};

////////
export const bridgerFormHandler = async function (player: mc.Player) {
  const { selection: bridgerSelection } = await form.bridgerForm(player);

  // bridgerForm: general
  if (bridgerSelection === 10) {
    const { selection: islandSelection } = await form.bridgerIslandForm(player);

    if (islandSelection === 10) handleDistanceChange(player, 16);
    if (islandSelection === 19) handleDistanceChange(player, 21);
    if (islandSelection === 28) handleDistanceChange(player, 50);
    if (islandSelection === 12) handleHeightChange(player, true);
    if (islandSelection === 21) handleHeightChange(player, false);
  }

  // bridgerForm: block
  if (bridgerSelection === 12) {
    const { selection: blockSelection } = await form.bridgerBlockForm(player);
    const blockObj = data.formBlocks[blockSelection - 9];

    tempData.blockBridger = blockObj.texture;
    util.giveItems(player, data.getInvData("straightBridger"));
    util.confirmMessage(player, `§aThe block has changed to§r §6${blockObj.blockName}§r§a!`, "random.orb");
  }

  // bridgerForm: reset pb
  if (bridgerSelection === 14) {
    const { selection: confirmSelection } = await confirmationForm(player);
    if (confirmSelection !== 15) return;
    DynamicProperty.resetDynamicBridgerData(DynamicPropertyID.PB);
    util.confirmMessage(player, "§aSuccess! Your personal best score has been reset!", "random.orb");
    updateFloatingText();
  }

  // bridgerForm: quit bridger
  if (bridgerSelection === 16) {
    DynamicProperty.postData();
    resetMap(false);
    util.backToLobbyKit(player);
  }
};

export const placingBlockEvt = function (block: mc.Block) {
  if (!bridger.blocks && !bridger.timer) bridger.timer = mc.system.runInterval(() => bridger.timer && bridger.ticks++);

  bridger.blocks++;
  bridger.storedLocations.push(block.location);
};

export const pressurePlatePushEvt = function () {
  if (bridger.plateDisabled) return;

  // stop the timer, disable plate, and start auto-req
  if (bridger.timer) {
    mc.system.clearRun(bridger.timer);
    bridger.timer = null;
  }
  bridger.plateDisabled = true;
  bridger.autoReq = mc.system.runTimeout(enablePlate, 80);

  // checking whether personal best
  if (
    DynamicProperty.getDynamicBridgerData(DynamicPropertyID.PB) === -1 ||
    bridger.ticks < DynamicProperty.getDynamicBridgerData(DynamicPropertyID.PB)
  ) {
    // new personal best
    DynamicProperty.setDynamicBridgerData(DynamicPropertyID.PB, bridger.ticks);
    showMessage(true);
  } else showMessage(false);

  mc.world.getDimension("overworld").spawnEntity("fireworks_rocket", bridger.player.location);
  bridger.player.playSound("random.levelup");

  DynamicProperty.addDynamicBridgerData(DynamicPropertyID.Attempts);
  DynamicProperty.addDynamicBridgerData(DynamicPropertyID.SuccessAttempts);
};

export const listener = function () {
  if (bridger.player.location.y <= 95) {
    if (bridger.plateDisabled) enablePlate(true);
    else {
      if (bridger.timer) {
        mc.system.clearRun(bridger.timer);
        bridger.timer = null; // disabling temp
      }
      DynamicProperty.addDynamicBridgerData(DynamicPropertyID.Attempts);
      resetMap();
      util.giveItems(bridger.player, data.getInvData(tempData.gameID));
    }
  }

  bridger.player.onScreenDisplay.setTitle(
    `      §b§lAUTO World§r\n§7-------------------§r\n §7- §6Personal Best:§r\n   ${
      DynamicProperty.getDynamicBridgerData(DynamicPropertyID.PB) === -1
        ? "--.--"
        : util.tickToSec(DynamicProperty.getDynamicBridgerData(DynamicPropertyID.PB))
    }\n\n §7- §6Time:§r\n   ${util.tickToSec(bridger.ticks)}\n\n §7- §6Blocks:§r\n   ${
      bridger.blocks
    }\n§7-------------------§r\n §8§oVersion 4 | ${util.today}`
  );
};

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
mc.world.afterEvents.chatSend.subscribe(({ sender: player }) => {
  bridger.player = player;
  player.sendMessage("player now defined");
  //////////////////////////////////////////////////
  // make sure to go back to lobby before reloading
  // debug from here
  player.sendMessage(util.getProperty(DynamicPropertyID.PB));
  player.sendMessage(util.getProperty(DynamicPropertyID.Attempts));
  player.sendMessage(util.getProperty(DynamicPropertyID.SuccessAttempts));
  player.sendMessage(util.getProperty(DynamicPropertyID.GameDatas));
});
