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
  wasPB
    ? bridger.player.sendMessage(
        `§7----------------------------§r\n   §bBridger§r §8§o- Version 4§r\n\n   §6Your Personal Best:§r §f${
          dynamicProperty.getPB("straight21b") === -1 ? "--.--" : tickToSec(dynamicProperty.getPB("straight21b"))
        }§f\n   §6Time Recorded:§r §f${tickToSec(
          bridger.ticks
        )}§r\n\n   §d§lNEW PERSONAL BEST!!§r\n§7----------------------------`
      )
    : bridger.player.sendMessage(
        `§7----------------------------§r\n   §bBridger§r §8§o- Version 4§r\n\n   §6Your Personal Best:§r §f${
          dynamicProperty.getPB("straight21b") === -1 ? "--.--" : tickToSec(dynamicProperty.getPB("straight21b"))
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
  const pbData = dynamicProperty.getPB("straight21b");
  const info = {
    pb: pbData === -1 ? "--.--" : tickToSec(pbData),
    attempts: dynamicProperty.getAttempts("straight21b"),
    successAttempts: dynamicProperty.getSuccessAttempts("straight21b"),
  };
  const successFailRatio = (info.successAttempts / info.attempts).toFixed(2);
  const displayText = `§7---§r §b${bridger.player.nameTag}'s Stats§r §7---§r\n§6Personal Best:§r §f${info.pb}§r\n§6Bridging Attempts:§r §f${info.attempts}§r\n§6Successful Attempts:§r §f${info.successAttempts}§r\n§6Success / Fail Ratio:§r §f${successFailRatio}`;

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
        { item: "minecraft:wooden_pickaxe", quantity: 1 },
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
 * @param {Object} structure - object that contains name, file, and location
 * @param {Vector3[]} clearLocation - contains location to fill with air
 * @param {Vector3} placeLocation - contains the location to place structure
 */
const fillAndPlace = function (structure, clearLocation, placeLocation) {
  const dimension = mc.world.getDimension("overworld");

  dimension.fillBlocks(new mc.BlockVolume(clearLocation[0], clearLocation[1]), "minecraft:air");
  mc.world.structureManager.place(structure.file, dimension, placeLocation[0]);
};

/////////////////////////////////////////////////////////
export const defineBridger = function (pl) {
  bridger.player = pl;
};

export const bridgerFormHandler = async function (player) {
  const { selection: bridgerSelection } = await form.bridgerForm(player);

  // bridgerForm: general
  if (bridgerSelection === 1) {
    const { selection: generalSelection } = await form.bridgerGeneralForm(player);
    switch (generalSelection) {
      case 10:
        const { selection: blockSelection } = await form.bridgerBlockForm(player);
        const block = data.blocks[blockSelection];
        data.tempData.block = block.texture;
        exp.confirmMessage(player, `§aThe block has changed to§r §6${block.blockName}§r§a!`, "random.orb");
        break;
    }
  }

  // bridgerForm: island
  if (bridgerSelection === 3) {
    const { selection: islandSelection } = await form.bridgerIslandForm(player);
    const structure = data.structure[data.tempData.structureIndex];
    const { stairCased, flat } = structure.location;

    // CHECK selection for distance
    switch (islandSelection) {
      case 10: // 16b
        break;
      case 19: // 25b
        break;
      case 28: // 50b
        break;
      case 12: // staircased
        if (dynamicProperty.getBoolean("straightHeight"))
          return exp.confirmMessage(player, "§4The height is already staircased!", "random.anvil_land");
        dynamicProperty.switchBoolean("straightHeight");
        fillAndPlace(structure, flat, stairCased);
        exp.confirmMessage(player, `§aThe height is now§r §6StairCased§r§a!`, "random.orb");
        break;
      case 21: // flat
        if (!dynamicProperty.getBoolean("straightHeight"))
          return exp.confirmMessage(player, "§4The height is already flat!", "random.anvil_land");
        dynamicProperty.switchBoolean("straightHeight");
        fillAndPlace(structure, stairCased, flat);
        exp.confirmMessage(player, `§aThe height is now§r §6Flat§r§a!`, "random.orb");
        break;
    }
  }

  // bridgerForm: reset pb
  if (bridgerSelection === 5) {
    try {
      const { selection: confirmSelection } = await form.confirmationForm(player);
      if (confirmSelection !== 6) return;
      dynamicProperty.resetPB("straight21b");
      exp.confirmMessage(player, "§aSuccess! Your personal best score has been reset!", "random.orb");
      updateFloatingText();
    } catch (err) {
      player.sendMessage(`§4Error, please try again. (error: ${err})`);
    }
  }

  // bridgerForm: quit bridger
  if (bridgerSelection === 7) {
    exp.setGameId("lobby");
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

  // stop the timer, disable plate, and start auto-req
  if (bridger.timer) mc.system.clearRun(bridger.timer);
  bridger.plateDisabled = true;
  bridger.autoReq = mc.system.runTimeout(enablePlate, 80);

  // checking whether personal best
  if (dynamicProperty.getPB("straight21b") === -1 || bridger.ticks < dynamicProperty.getPB("straight21b")) {
    // new personal best
    dynamicProperty.setPB("straight21b", bridger.ticks);
    showMessage(true);
  } else showMessage(false);
  dynamicProperty.addAttempts("straight21b");
  dynamicProperty.addSuccessAttempts("straight21b");

  const dimension = mc.world.getDimension("overworld");
  dimension.spawnEntity("minecraft:fireworks_rocket", {
    x: 9998,
    y: 101,
    z: 10027,
  });
  dimension.spawnEntity("minecraft:fireworks_rocket", {
    x: 10002,
    y: 101,
    z: 10027,
  });
};

export const listener = function () {
  if (bridger.player.location.y <= 88) {
    if (bridger.plateDisabled) enablePlate(true);
    else {
      if (bridger.timer) {
        mc.system.clearRun(bridger.timer);
        bridger.timer = null; // disabling temp
      }
      dynamicProperty.addAttempts("straight21b");
      resetMap();
    }
  }

  bridger.player.onScreenDisplay.setTitle(
    `      §b§lAUTO World§r\n§7-------------------§r\n §7- §6Personal Best:§r\n   ${
      dynamicProperty.getPB("straight21b") === -1 ? "--.--" : tickToSec(dynamicProperty.getPB("straight21b"))
    }\n\n §7- §6Time:§r\n   ${tickToSec(bridger.ticks)}\n\n §7- §6Blocks:§r\n   ${
      bridger.blocks
    }\n§7-------------------§r\n §8§oVersion 4 | ${today}`
  );
};

// CHECK DEBUGGING PURPOSES
mc.world.afterEvents.chatSend.subscribe((e) => {
  e.cancel = true;
  const player = e.sender;
  bridger.player = player;
  mc.world.sendMessage("bridger player now defined");
  //////////////////////////////////////////////////
  // debug from here
  mc.world.sendMessage(String(dynamicProperty.getBoolean("straightHeight")));
});
