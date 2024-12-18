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
 * @param {Object} structure - an object from data.structures
 * @param {Object} {distance1:"1"|"2"|"3", isStairCased1:Boolean} - info which filled with air
 * @param {Object} {distance2:"1"|"2"|"3", isStairCased2:Boolean} - info which new structure will be built
 */
const fillAndPlace = function (
  structure,
  { distance: distance1, isStairCased: isStairCased1 },
  { distance: distance2, isStairCased: isStairCased2 }
) {
  // CHECK check is distance1 and distance2 is vaild input
  const dimension = mc.world.getDimension("overworld");
  const fillAirLocation = {
    start: { x: 9993, y: null, z: null },
    end: { x: 10005, y: null, z: null },
  };
  const structurePlaceLocation = { x: 9993, y: null, z: null };

  // fillAirLocation
  if (distance1 === "1") {
    fillAirLocation.start.y = !isStairCased1 ? 93 : 94;
    fillAirLocation.start.z = 10019;
  }
  if (distance1 === "2") {
    fillAirLocation.start.y = !isStairCased1 ? 93 : 95;
    fillAirLocation.start.z = 10024;
  }
  if (distance1 === "3") {
    fillAirLocation.start.y = !isStairCased1 ? 93 : 98;
    fillAirLocation.start.z = 10053;
  }
  fillAirLocation.end.y = fillAirLocation.start.y + 13;
  fillAirLocation.end.z = fillAirLocation.start.z + 9;

  // structure place location
  if (distance2 === "1") {
    structurePlaceLocation.y = !isStairCased2 ? 93 : 94;
    structurePlaceLocation.z = 10019;
  }
  if (distance2 === "2") {
    structurePlaceLocation.y = !isStairCased2 ? 93 : 95;
    structurePlaceLocation.z = 10024;
  }
  if (distance2 === "3") {
    structurePlaceLocation.y = !isStairCased2 ? 93 : 98;
    structurePlaceLocation.z = 10053;
  }

  // filling with air
  dimension.fillBlocks(new mc.BlockVolume(fillAirLocation.start, fillAirLocation.end), "minecraft:air");
  mc.world.structureManager.place(structure.file, dimension, structurePlaceLocation);
};

/////////////////////////////////////////////////////////
export const defineBridger = function (pl) {
  bridger.player = pl;
};

export const bridgerFormHandler = async function (player) {
  const { selection: bridgerSelection } = await form.bridgerForm(player);

  // bridgerForm: general
  if (bridgerSelection === 10) {
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
  if (bridgerSelection === 12) {
    const { selection: islandSelection } = await form.bridgerIslandForm(player);

    // CHECK selection for distance
    switch (islandSelection) {
      case 10: // 16b
        if (dynamicProperty.getGameData("straightDistance") === "1")
          return exp.confirmMessage(player, "§4The distance is already 16 blocks!", "random.anvil_land");
        fillAndPlace(
          data.structures[0],
          {
            distance: dynamicProperty.getGameData("straightDistance"),
            isStairCased: dynamicProperty.getGameData("straightHeight") === "S",
          },
          { distance: "1", isStairCased: dynamicProperty.getGameData("straightHeight") === "S" }
        );
        dynamicProperty.setGameData("straightDistance", "1");
        exp.confirmMessage(player, `§aThe distance is now§r §616 Blocks§r§a!`, "random.orb");
        break;

      case 19: // 21b
        if (dynamicProperty.getGameData("straightDistance") === "2")
          return exp.confirmMessage(player, "§4The distance is already 21 blocks!", "random.anvil_land");
        fillAndPlace(
          data.structures[0],
          {
            distance: dynamicProperty.getGameData("straightDistance"),
            isStairCased: dynamicProperty.getGameData("straightHeight") === "S",
          },
          { distance: "2", isStairCased: dynamicProperty.getGameData("straightHeight") === "S" }
        );
        dynamicProperty.setGameData("straightDistance", "2");
        exp.confirmMessage(player, `§aThe distance is now§r §621 Blocks§r§a!`, "random.orb");
        break;

      case 28: // 50b
        if (dynamicProperty.getGameData("straightDistance") === "3")
          return exp.confirmMessage(player, "§4The distance is already 50 blocks!", "random.anvil_land");
        fillAndPlace(
          data.structures[0],
          {
            distance: dynamicProperty.getGameData("straightDistance"),
            isStairCased: dynamicProperty.getGameData("straightHeight") === "S",
          },
          { distance: "3", isStairCased: dynamicProperty.getGameData("straightHeight") === "S" }
        );
        dynamicProperty.setGameData("straightDistance", "3");
        exp.confirmMessage(player, `§aThe distance is now§r §650 Blocks§r§a!`, "random.orb");
        break;

      case 12: // staircased
        if (dynamicProperty.getGameData("straightHeight") === "S")
          return exp.confirmMessage(player, "§4The height is already staircased!", "random.anvil_land");
        dynamicProperty.setGameData("straightHeight", "S");

        fillAndPlace(
          data.structures[0],
          { distance: dynamicProperty.getGameData("straightDistance"), isStairCased: false },
          { distance: dynamicProperty.getGameData("straightDistance"), isStairCased: true }
        );
        exp.confirmMessage(player, `§aThe height is now§r §6StairCased§r§a!`, "random.orb");
        break;

      case 21: // flat
        if (dynamicProperty.getGameData("straightHeight") === "F")
          return exp.confirmMessage(player, "§4The height is already flat!", "random.anvil_land");
        dynamicProperty.setGameData("straightHeight", "F");
        fillAndPlace(
          data.structures[0],
          { distance: dynamicProperty.getGameData("straightDistance"), isStairCased: true },
          { distance: dynamicProperty.getGameData("straightDistance"), isStairCased: false }
        );
        exp.confirmMessage(player, `§aThe height is now§r §6Flat§r§a!`, "random.orb");
        break;
    }
  }

  // bridgerForm: reset pb
  if (bridgerSelection === 14) {
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
  if (bridgerSelection === 16) {
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
mc.world.afterEvents.chatSend.subscribe(({ sender: player }) => {
  bridger.player = player;
  mc.world.sendMessage("bridger player now defined");
  //////////////////////////////////////////////////
  // debug from here
});
