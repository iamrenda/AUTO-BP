import * as mc from "@minecraft/server";
import * as exp from "./functions.js";
import * as data from "./data.js";
import dynamicProperty from "./dynamicProperty.js";

import * as lobby from "../games/lobby.js";
import * as bridger from "../games/bridger.js";

// player right-click an item
mc.world.afterEvents.itemUse.subscribe(({ itemStack: item, source: player }) => {
  switch (dynamicProperty.getGameId()) {
    case "lobby":
      if (item.typeId === "minecraft:compass") lobby.nagivatorFormHandler(player);
      if (item.typeId === "minecraft:fishing_rod") lobby.launchingHandler(player);
      break;

    case "straight16b":
    case "straight21b":
    case "straight50b":
      if (item.typeId === "minecraft:book") bridger.bridgerFormHandler(player);
      break;
  }
});

// player placing a block
mc.world.afterEvents.playerPlaceBlock.subscribe(({ block }) => {
  switch (dynamicProperty.getGameId()) {
    case "straight16b":
    case "straight21b":
    case "straight50b":
      bridger.placingBlockEvt(block);
      break;
  }
});

// player pushed a pressureplate
mc.world.afterEvents.pressurePlatePush.subscribe(() => {
  switch (dynamicProperty.getGameId()) {
    case "straight16b":
    case "straight21b":
    case "straight50b":
      bridger.pressurePlatePushEvt();
      break;
  }
});

/////////////////////////////////////////////////////////////////////////////////
// player joining the world
mc.world.afterEvents.playerSpawn.subscribe(({ player }) => {
  bridger.defineBridger(player);
  exp.teleportation(player, data.locationData.lobby);
  exp.giveItems(player, [
    { item: "minecraft:stick", quantity: 1, slot: 2, name: "§9Launching Stick" },
    { item: "minecraft:compass", quantity: 1, slot: 4 },
  ]);
});

// player leaving the world
mc.world.beforeEvents.playerLeave.subscribe(() => dynamicProperty.setGameId("lobby"));

// player breaking a block
mc.world.beforeEvents.playerBreakBlock.subscribe((e) => (e.cancel = true));

// interaction with block
mc.world.beforeEvents.playerInteractWithBlock.subscribe((e) => (e.cancel = !e.block.isSolid));

/////////////////////////////////////////////////////////////////////////////////
// every tick
mc.system.runInterval(() => {
  switch (dynamicProperty.getGameId()) {
    case "straight16b":
    case "straight21b":
    case "straight50b":
      bridger.listener();
      break;
  }
});

/*
switch (exp.getGameId()) {
    case "lobby":
      break;
    case "bridger":
      break;
  }
*/
