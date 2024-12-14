import { world, system, ItemStack } from "@minecraft/server"; // CHECK why the fuck am i doing like this

import { getGameId, setGameId } from "../script/export.js";
import { bridgerForm } from "../script/forms.js";
import {
  locationData,
  giveItems,
  getPB,
  setPB,
  getAttempts,
  addAttempts,
  getSuccessAttempts,
  addSuccessAttempts,
} from "../script/export.js"; // CHECK wtf is this

const date = new Date();
const today = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
  date.getDate()
).padStart(2, "0")}/${String(date.getFullYear()).slice(-2)}`;

const bridger = {
  player: null,
  storedLocations: [],
  blocks: 0,
  ticks: 0,

  timer: null, // interval
  plateDisabled: false,
  autoReq: null, // timeOut
};

const tickToSec = function (ticks) {
  return (ticks / 20).toFixed(2);
};

const showMessage = function (wasPB) {
  wasPB
    ? bridger.player.sendMessage(
        `§7----------------------------§r\n   §bBridger§r §8§o- Version 4§r\n\n   §6Your Personal Best:§r §f${
          getPB("straight25b") === -1
            ? "--.--"
            : tickToSec(getPB("straight25b"))
        }§f\n   §6Time Recorded:§r §f${tickToSec(
          bridger.ticks
        )}§r\n\n   §d§lNEW PERSONAL BEST!!§r\n§7----------------------------`
      )
    : bridger.player.sendMessage(
        `§7----------------------------§r\n   §bBridger§r §8§o- Version 4§r\n\n   §6Your Personal Best:§r §f${
          getPB("straight25b") === -1
            ? "--.--"
            : tickToSec(getPB("straight25b"))
        }§f\n   §6Time Recorded:§r §f${tickToSec(
          bridger.ticks
        )}§r\n§7----------------------------`
      );
};

/**
 * resetMap: resets the map (clearing temp data, blocks, and teleporting)
 *
 * @param {boolean} wasAttempt - whether storing briding data is necessary or not
 */
export const resetMap = function (wasAttempt = true) {
  // clear bridged blocks
  if (bridger.storedLocations.length)
    bridger.storedLocations.map((location) =>
      world.getDimension("overworld").setBlockType(location, "minecraft:air")
    );
  bridger.storedLocations = [];

  // reset blocks and ticks
  bridger.blocks = 0;
  bridger.ticks = 0;

  // teleport player
  wasAttempt
    ? bridger.player.teleport(locationData.bridger.straight.position, {
        facingLocation: locationData.bridger.straight.facing,
      })
    : bridger.player.tryTeleport(locationData.lobby.position, {
        facingLocation: locationData.lobby.facing,
      });

  // give items to player
  const items = wasAttempt
    ? [
        { item: "minecraft:sandstone", quantity: 64 },
        { item: "minecraft:sandstone", quantity: 64 },
        { item: "minecraft:wooden_pickaxe", quantity: 1 },
        { item: "minecraft:book", quantity: 1, slot: 8 },
      ]
    : [{ item: "minecraft:compass", quantity: 1, slot: 4 }];
  giveItems(bridger.player, items);
};

/**
 * enablePlate: re-enable pressure plate (disabled temp when plate is pressed)
 *
 * @param {cancelTimer} wasAttempt - whether canceling timer to resetMap is necessary or not
 */
const enablePlate = function (cancelTimer = false) {
  bridger.plateDisabled = false;
  if (cancelTimer) system.clearRun(bridger.autoReq);
  resetMap();
};

/////////////////////////////////////////////////////////

world.afterEvents.playerSpawn.subscribe(
  ({ player: pl }) => (bridger.player = pl)
);

world.afterEvents.itemUse.subscribe(({ itemStack: item, source: player }) => {
  if (getGameId() !== "bridger") return;

  if (item.typeId === "minecraft:book") bridgerForm(player);
});

world.afterEvents.playerPlaceBlock.subscribe(({ block }) => {
  if (getGameId() !== "bridger") return;

  if (!bridger.blocks) {
    bridger.timer = system.runInterval(
      () => bridger.timer && bridger.ticks++,
      1
    );
  }

  bridger.blocks++;
  bridger.storedLocations.push(block.location);
});

world.afterEvents.pressurePlatePush.subscribe(({ source: player }) => {
  if (getGameId() !== "bridger" || bridger.plateDisabled) return;

  if (bridger.timer) system.clearRun(bridger.timer);
  bridger.plateDisabled = true;
  bridger.autoReq = system.runTimeout(enablePlate, 80);

  // checking whether personal best
  if (getPB("straight25b") === -1 || bridger.ticks < getPB("straight25b")) {
    // new personal best
    setPB("straight25b", bridger.ticks);
    showMessage(true);
  } else showMessage(false);
  addAttempts("straight25b");
  addSuccessAttempts("straight25b");

  const dimension = world.getDimension("overworld");
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
});

system.runInterval(() => {
  if (getGameId() !== "bridger") return;

  if (bridger.player.location.y <= 88) {
    if (bridger.plateDisabled) enablePlate(true);
    else {
      if (bridger.timer) {
        system.clearRun(bridger.timer);
        bridger.timer = null; // disabling temp
      }
      resetMap();
      addAttempts("straight25b");
    }
  }

  bridger.player.onScreenDisplay.setTitle(
    `      §b§lAUTO World§r\n§7-------------------§r\n §7- §6Personal Best:§r\n   ${
      getPB("straight25b") === -1 ? "--.--" : tickToSec(getPB("straight25b"))
    }\n\n §7- §6Time:§r\n   ${tickToSec(
      bridger.ticks
    )}\n\n §7- §6Blocks:§r\n   ${
      bridger.blocks
    }\n§7-------------------§r\n §8§oVersion 4 | ${today}`
  );
}, 1);

// CHECK DEBUGGING PURPOSES
world.beforeEvents.chatSend.subscribe((e) => {
  const player = e.sender;
  e.cancel = true;
  bridger.player = player;

  player.sendMessage(String(world.getDynamicPropertyIds().length));
  player.sendMessage(world.getDynamicProperty("auto:pb"));
  player.sendMessage(world.getDynamicProperty("auto:atmps"));
  player.sendMessage(world.getDynamicProperty("auto:successAtmps"));

  // world.sendMessage("PLAYER IS NOW DEFINED");
});

// CHECK DEBUGGING PURPOSES
world.afterEvents.itemUse.subscribe(({ itemStack: item, source: player }) => {
  if (item.typeId !== "minecraft:barrier") return;
});
