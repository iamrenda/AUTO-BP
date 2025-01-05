import * as mc from "@minecraft/server";
import * as exp from "../utilities/utilities";
import * as data from "../utilities/staticData";

import * as form from "forms/bridger";
import dynamicProperty from "../utilities/dynamicProperty";
import { confirmationForm } from "forms/utility";
import { BridgerTempID, GameDataID, DynamicPropertyID } from "models/DynamicProperty";
import StructureInfo from "models/StructureInfo";
import TeleportationLocation from "models/TeleportationLocation";

type Bridger = {
  player: mc.Player;
  storedLocations: mc.Vector3[];
  blocks: number;
  ticks: number;

  timer?: number;
  plateDisabled: boolean;
  autoReq?: number;
};

const bridger: Bridger = {
  player: null,

  storedLocations: [],
  blocks: 0,
  ticks: 0,

  timer: null, // interval
  plateDisabled: false,
  autoReq: null, // timeOut
};

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/**
 * converts from tick to seconds
 */
const tickToSec = function (ticks: number): string {
  return (ticks / 20).toFixed(2);
};

/**
 * shows the result of the bridging
 */
const showMessage = function (wasPB) {
  const bridgerGame = data.tempData.bridgerMode;
  const gameId = dynamicProperty.getGameId();

  const getMessage = (distance, pb, time, newPB = false) => `§7----------------------------§r
   §bBridger§r §8§o- Version 4§r

   §6Distance:§r §f${distance} Blocks
   §6Your Personal Best:§r §f${pb === -1 ? "--.--" : tickToSec(pb)}§f
   §6Time Recorded:§r §f${tickToSec(time)}§r
   ${newPB ? "§d§lNEW PERSONAL BEST!!§r\n" : ""}
§7----------------------------`;

  if (["straightBridger", "inclinedBridger"].includes(gameId)) {
    const distance =
      gameId === "straightBridger"
        ? dynamicProperty.getGameData(GameDataID.straightDistance)
        : dynamicProperty.getGameData(GameDataID.inclinedDistance);
    const message = getMessage(distance, dynamicProperty.getPB(bridgerGame), bridger.ticks, wasPB);
    bridger.player.sendMessage(message);
  }
};

/**
 * floating entity grabber
 */
const floatingEntity = function (): mc.Entity {
  switch (dynamicProperty.getGameId()) {
    case "straightBridger":
      return mc.world.getDimension("overworld").getEntities({ location: { x: 9997.2, y: 100.45, z: 10004.51 } })[0];
    case "inclinedBridger":
      return mc.world.getDimension("overworld").getEntities({ location: { x: 9974.08, y: 100.0, z: 10002.96 } })[0];
  }
};

/**
 * updates the floating texts including stats about the player
 */
const updateFloatingText = () => {
  const game = data.tempData.bridgerMode;
  const pbData = dynamicProperty.getPB(game);
  const info = {
    pb: pbData === -1 ? "--.--" : tickToSec(pbData),
    attempts: dynamicProperty.getAttempts(game),
    successAttempts: dynamicProperty.getSuccessAttempts(game),
  };
  const successFailRatio = (info.successAttempts / info.attempts).toFixed(2);
  const distance = dynamicProperty.getGameData(GameDataID.straightDistance);

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
  const gameId = dynamicProperty.getGameId();

  // clear bridged blocks
  if (bridger.storedLocations.length)
    bridger.storedLocations.map((location) =>
      mc.world.getDimension("overworld").setBlockType(location, "minecraft:air")
    );

  // reset blocks and ticks
  resetBridgerData();

  // update floating text
  if (wasAttempt) updateFloatingText();

  // give items to player
  exp.giveItems(bridger.player, data.getInvData(wasAttempt ? gameId : "lobby"));

  // teleport player
  wasAttempt
    ? exp.teleportation(bridger.player, <TeleportationLocation>data.locationData[gameId])
    : exp.teleportation(bridger.player, <TeleportationLocation>data.locationData.lobby);
};

/**
 * re-enable pressure plate (disabled temp when plate is pressed)
 * @param {Boolean} cancelTimer - whether canceling timer to resetMap is necessary or not
 */
const enablePlate = function (cancelTimer: boolean = false): void {
  bridger.plateDisabled = false;
  if (cancelTimer) mc.system.clearRun(bridger.autoReq);
  resetMap();
};

/**
 * clear previous island and place new island at new location
 * @param {Object} info which filled with air
 * @param {Object} info which new structure will be built
 */ // CHECK
type FillAndPlaceIF = {
  distance: 16 | 21 | 50;
  isStairCased: boolean;
};
const fillAndPlace = function (
  structure: StructureInfo,
  { distance: distance1, isStairCased: isStairCased1 }: FillAndPlaceIF,
  { distance: distance2, isStairCased: isStairCased2 }: FillAndPlaceIF
): void {
  const dimension = mc.world.getDimension("overworld");
  const fillAirLocation = {
    start: { x: 9993, y: undefined, z: undefined },
    end: { x: 10005, y: undefined, z: undefined },
  };
  const structurePlaceLocation = { x: 9993, y: undefined, z: undefined };

  // fillAirLocation
  if (distance1 === 16) {
    fillAirLocation.start.y = !isStairCased1 ? 93 : 94;
    fillAirLocation.start.z = 10019;
  }
  if (distance1 === 21) {
    fillAirLocation.start.y = !isStairCased1 ? 93 : 95;
    fillAirLocation.start.z = 10024;
  }
  if (distance1 === 50) {
    fillAirLocation.start.y = !isStairCased1 ? 93 : 98;
    fillAirLocation.start.z = 10053;
  }
  fillAirLocation.end.y = fillAirLocation.start.y + 13;
  fillAirLocation.end.z = fillAirLocation.start.z + 9;

  // structure place location
  if (distance2 === 16) {
    structurePlaceLocation.y = !isStairCased2 ? 93 : 94;
    structurePlaceLocation.z = 10019;
  }
  if (distance2 === 21) {
    structurePlaceLocation.y = !isStairCased2 ? 93 : 95;
    structurePlaceLocation.z = 10024;
  }
  if (distance2 === 50) {
    structurePlaceLocation.y = !isStairCased2 ? 93 : 98;
    structurePlaceLocation.z = 10053;
  }

  // filling with air
  dimension.fillBlocks(new mc.BlockVolume(fillAirLocation.start, fillAirLocation.end), "minecraft:air");
  mc.world.structureManager.place(structure.file, dimension, structurePlaceLocation);
};

/**
 * replace island based on distance and save in dynamic property
 */
const handleDistanceChange = function (player: mc.Player, blocks: IslandDistance): void {
  // check whether player clicked on the same distance
  if (dynamicProperty.getGameData(GameDataID.straightDistance) === String(blocks))
    return exp.confirmMessage(player, "§4The distance is already has been changed!", "random.anvil_land");

  fillAndPlace(
    data.structures[0],
    {
      distance: <IslandDistance>+dynamicProperty.getGameData(GameDataID.straightDistance),
      isStairCased: dynamicProperty.getGameData(GameDataID.straightIsStairCased),
    },
    { distance: blocks, isStairCased: dynamicProperty.getGameData(GameDataID.straightIsStairCased) }
  );

  // set distance as dynamic property, set bridger mode for temp data
  dynamicProperty.setGameData(GameDataID.straightDistance, blocks);
  exp.setBridgerMode(<BridgerTempID>`straight${blocks}b`);

  exp.confirmMessage(player, `§aThe distance is now§r §6${blocks} blocks§r§a!`, "random.orb");
  updateFloatingText();
};

/**
 * replace island based on height and save in dynamic property
 */
const handleHeightChange = function (player: mc.Player, isStairCased: boolean): void {
  // check whether player clicked on the same distance
  if (dynamicProperty.getGameData(GameDataID.straightIsStairCased) === isStairCased)
    return exp.confirmMessage(player, "§4The height is already has been changed!", "random.anvil_land");

  fillAndPlace(
    data.structures[0],
    {
      distance: <IslandDistance>+dynamicProperty.getGameData(GameDataID.straightDistance),
      isStairCased: !isStairCased,
    },
    { distance: <IslandDistance>+dynamicProperty.getGameData(GameDataID.straightDistance), isStairCased: isStairCased }
  );

  // set staircased as dynamic property
  dynamicProperty.setGameData(GameDataID.straightIsStairCased, isStairCased);

  exp.confirmMessage(player, `§aThe height is now§r §6${isStairCased ? "StairCased" : "Flat"}§r§a!`, "random.orb");
};

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
export const defineBridger = function (pl: mc.Player) {
  bridger.player = pl;
};

export const bridgerFormHandler = async function (player: mc.Player) {
  const game = data.tempData.bridgerMode;
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

    data.tempData.blockBridger = blockObj.texture;
    exp.giveItems(player, data.getInvData("straightBridger"));
    exp.confirmMessage(player, `§aThe block has changed to§r §6${blockObj.blockName}§r§a!`, "random.orb");
  }

  // bridgerForm: reset pb
  if (bridgerSelection === 14) {
    const { selection: confirmSelection } = await confirmationForm(player);
    if (confirmSelection !== 15) return;
    dynamicProperty.resetPB(game);
    exp.confirmMessage(player, "§aSuccess! Your personal best score has been reset!", "random.orb");
    updateFloatingText();
  }

  // bridgerForm: quit bridger
  if (bridgerSelection === 16) {
    dynamicProperty.setGameId("lobby");
    resetMap(false);
    exp.confirmMessage(player, "§7Teleporting back to lobby...");
  }
};

export const placingBlockEvt = function (block: mc.Block) {
  if (!bridger.blocks) bridger.timer = mc.system.runInterval(() => bridger.timer && bridger.ticks++);

  bridger.blocks++;
  bridger.storedLocations.push(block.location);
};

export const pressurePlatePushEvt = function () {
  if (bridger.plateDisabled) return;

  const game = data.tempData.bridgerMode;

  // stop the timer, disable plate, and start auto-req
  if (bridger.timer) mc.system.clearRun(bridger.timer);
  bridger.plateDisabled = true;
  bridger.autoReq = mc.system.runTimeout(enablePlate, 80);

  // checking whether personal best
  if (dynamicProperty.getPB(game) === -1 || bridger.ticks < dynamicProperty.getPB(game)) {
    // new personal best
    dynamicProperty.setPB(game, bridger.ticks);
    showMessage(true);
  } else showMessage(false);
  dynamicProperty.addAttempts(game);
  dynamicProperty.addSuccessAttempts(game);
};

export const listener = function () {
  const game = data.tempData.bridgerMode;

  if (bridger.player.location.y <= 88) {
    if (bridger.plateDisabled) enablePlate(true);
    else {
      if (bridger.timer) {
        mc.system.clearRun(bridger.timer);
        bridger.timer = null; // disabling temp
      }
      dynamicProperty.addAttempts(game);
      resetMap();
    }
  }

  bridger.player.onScreenDisplay.setTitle(
    `      §b§lAUTO World§r\n§7-------------------§r\n §7- §6Personal Best:§r\n   ${
      dynamicProperty.getPB(game) === -1 ? "--.--" : tickToSec(dynamicProperty.getPB(game))
    }\n\n §7- §6Time:§r\n   ${tickToSec(bridger.ticks)}\n\n §7- §6Blocks:§r\n   ${
      bridger.blocks
    }\n§7-------------------§r\n §8§oVersion 4 | ${exp.today}`
  );
};

mc.world.afterEvents.chatSend.subscribe(({ sender: player }) => {
  bridger.player = player;
  data.tempData.bridgerMode = BridgerTempID.incline16blocks;
  player.sendMessage("player now defined");
  //////////////////////////////////////////////////
  // debug from here
});
