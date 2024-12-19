import * as mc from "@minecraft/server";
import * as exp from "../script/functions.js";
import * as data from "../script/data.js";
import * as form from "../script/forms.js";
import dynamicProperty from "../script/dynamicProperty.js";

const date = new Date();
const today = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${String(
  date.getFullYear()
).slice(-2)}`;

const bridger = {
  player: null,

  storedLocations: [],
  blocks: 0,
  ticks: 0,

  timer: null, // interval
  plateDisabled: false,
  autoReq: null, // timeOut
};

/**
 * tickToSec: converts from tick to seconds
 */
const tickToSec = function (ticks) {
  return (ticks / 20).toFixed(2);
};

/**
 * showMessage: shows the result of the bridging
 */
const showMessage = function (wasPB) {
  const game = dynamicProperty.getGameId();
  wasPB
    ? bridger.player.sendMessage(
        `§7----------------------------§r\n   §bBridger§r §8§o- Version 4§r\n\n   §6Distance:§r §f${dynamicProperty.getGameData(
          "straightDistance"
        )} Blocks\n   §6Your Personal Best:§r §f${
          dynamicProperty.getPB(game) === -1 ? "--.--" : tickToSec(dynamicProperty.getPB(game))
        }§f\n   §6Time Recorded:§r §f${tickToSec(
          bridger.ticks
        )}§r\n\n   §d§lNEW PERSONAL BEST!!§r\n§7----------------------------`
      )
    : bridger.player.sendMessage(
        `§7----------------------------§r\n   §bBridger§r §8§o- Version 4§r\n\n   §6Distance:§r §f${dynamicProperty.getGameData(
          "straightDistance"
        )} Blocks\n   §6Your Personal Best:§r §f${
          dynamicProperty.getPB(game) === -1 ? "--.--" : tickToSec(dynamicProperty.getPB(game))
        }§f\n   §6Time Recorded:§r §f${tickToSec(bridger.ticks)}§r\n§7----------------------------`
      );
};

/**
 * updateFloatingText: updates the floating texts including stats about the player
 */
const updateFloatingText = function () {
  const floatingEntity = mc.world
    .getDimension("overworld")
    .getEntities({ location: { x: 9997.2, y: 100.45, z: 10004.51 } })[0];
  const game = dynamicProperty.getGameId();
  const pbData = dynamicProperty.getPB(game);
  const info = {
    pb: pbData === -1 ? "--.--" : tickToSec(pbData),
    attempts: dynamicProperty.getAttempts(game),
    successAttempts: dynamicProperty.getSuccessAttempts(game),
  };
  const successFailRatio = (info.successAttempts / info.attempts).toFixed(2);
  const displayText = `§b${bridger.player.nameTag}§r §7-§r §o§7${dynamicProperty.getGameData(
    "straightDistance"
  )} blocks§r\n§6Personal Best:§r §f${info.pb}§r\n§6Bridging Attempts:§r §f${
    info.attempts
  }§r\n§6Successful Attempts:§r §f${info.successAttempts}§r\n§6Success / Fail Ratio:§r §f${successFailRatio}`;

  floatingEntity.nameTag = displayText;
};

/**
 * resetMap: resets the map (clearing temp data, blocks, and teleporting)
 *
 * @param {boolean} wasAttempt - whether storing briding data is necessary or not
 */
const resetMap = function (wasAttempt = true) {
  // clear bridged blocks
  if (bridger.storedLocations.length)
    bridger.storedLocations.map((location) =>
      mc.world.getDimension("overworld").setBlockType(location, "minecraft:air")
    );
  bridger.storedLocations = [];

  // reset blocks and ticks
  bridger.blocks = 0;
  bridger.ticks = 0;

  // update floating text
  updateFloatingText();

  // teleport player
  wasAttempt
    ? exp.teleportation(bridger.player, data.locationData.bridger.straight)
    : exp.teleportation(bridger.player, data.locationData.lobby);

  // give items to player
  const items = wasAttempt
    ? [
        { item: data.tempData.block, quantity: 64 },
        { item: data.tempData.block, quantity: 64 },
        { item: "minecraft:book", quantity: 1, slot: 8 },
      ]
    : [{ item: "minecraft:compass", quantity: 1, slot: 4 }];
  exp.giveItems(bridger.player, items);
};

/**
 * enablePlate: re-enable pressure plate (disabled temp when plate is pressed)
 *
 * @param {Boolean} cancelTimer - whether canceling timer to resetMap is necessary or not
 */
const enablePlate = function (cancelTimer = false) {
  bridger.plateDisabled = false;
  if (cancelTimer) mc.system.clearRun(bridger.autoReq);
  resetMap();
};

/**
 * fillAndPlace: clear previous island and place new island at new location
 *
 * @param {Object} structure - an object from data.structures
 * @param {Object} {distance1:16|21|50, isStairCased1:Boolean} - info which filled with air
 * @param {Object} {distance2:16|21|50, isStairCased2:Boolean} - info which new structure will be built
 */
const fillAndPlace = function (
  structure,
  { distance: distance1, isStairCased: isStairCased1 },
  { distance: distance2, isStairCased: isStairCased2 }
) {
  // CHECK check is distance1 and distance2 is vaild input
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
 * handleDistanceChange: replace island based on distance and save in dynamic property
 *
 * @param {Player} player - player object
 * @param {number} blocks - 16 | 21 | 50
 */
const handleDistanceChange = function (player, blocks) {
  if (dynamicProperty.getGameData("straightDistance") === String(blocks))
    return exp.confirmMessage(player, "§4The distance is already has been changed!", "random.anvil_land");
  fillAndPlace(
    data.structures[0],
    {
      distance: +dynamicProperty.getGameData("straightDistance"),
      isStairCased: dynamicProperty.getGameData("straightIsStairCased"),
    },
    { distance: blocks, isStairCased: dynamicProperty.getGameData("straightIsStairCased") }
  );
  dynamicProperty.setGameData("straightDistance", blocks);
  dynamicProperty.setGameId(`straight${blocks}b`);
  exp.confirmMessage(player, `§aThe distance is now§r §6${blocks} blocks§r§a!`, "random.orb");
  updateFloatingText();
};

/**
 * handleHeightChange: replace island based on height and save in dynamic property
 *
 * @param {Player} player - "S": StairCased | "F": Flat
 * @param {Boolean} isStairCased - new height
 */
const handleHeightChange = function (player, isStairCased) {
  if (dynamicProperty.getGameData("straightIsStairCased") === isStairCased)
    return exp.confirmMessage(player, "§4The height is already has been changed!", "random.anvil_land");
  fillAndPlace(
    data.structures[0],
    {
      distance: +dynamicProperty.getGameData("straightDistance"),
      isStairCased: !isStairCased,
    },
    { distance: +dynamicProperty.getGameData("straightDistance"), isStairCased: isStairCased }
  );
  dynamicProperty.setGameData("straightIsStairCased", isStairCased);
  exp.confirmMessage(player, `§aThe height is now§r §6${isStairCased ? "StairCased" : "Flat"}§r§a!`, "random.orb");
};

/////////////////////////////////////////////////////////
export const defineBridger = function (pl) {
  bridger.player = pl;
};

export const bridgerFormHandler = async function (player) {
  const game = dynamicProperty.getGameId();
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
    const blockObj = data.blocks[blockSelection - 9];
    data.tempData.block = blockObj.texture;
    exp.confirmMessage(player, `§aThe block has changed to§r §6${blockObj.blockName}§r§a!`, "random.orb");
  }

  // bridgerForm: reset pb
  if (bridgerSelection === 14) {
    const { selection: confirmSelection } = await form.confirmationForm(player);
    if (confirmSelection !== 6) return;
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

export const placingBlockEvt = function (block) {
  if (!bridger.blocks) {
    bridger.timer = mc.system.runInterval(() => bridger.timer && bridger.ticks++);
  }

  bridger.blocks++;
  bridger.storedLocations.push(block.location);
};

export const pressurePlatePushEvt = function () {
  if (bridger.plateDisabled) return;

  const game = dynamicProperty.getGameId();

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
  const game = dynamicProperty.getGameId();

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
    }\n§7-------------------§r\n §8§oVersion 4 | ${today}`
  );
};

// CHECK DEBUGGING PURPOSES
mc.world.afterEvents.chatSend.subscribe(({ sender: player }) => {
  bridger.player = player;
  //////////////////////////////////////////////////
  // debug from here
});
