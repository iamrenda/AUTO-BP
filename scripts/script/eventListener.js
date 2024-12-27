import * as mc from "@minecraft/server";
import * as exp from "./functions.js";
import * as data from "./staticData.js";
import dynamicProperty from "./dynamicProperty.js";

import * as lobby from "../games/lobby.js";
import * as bridger from "../games/bridger.js";
import * as clutcher from "../games/clutcher.js";

// player right-click an item
mc.world.afterEvents.itemUse.subscribe(({ itemStack: item, source: player }) => {
  switch (dynamicProperty.getGameId()) {
    case "lobby":
      if (item.typeId === "minecraft:compass") lobby.nagivatorFormHandler(player);
      if (item.typeId === "minecraft:stick") lobby.launchingHandler(player);
      if (item.typeId === "minecraft:book") lobby.creditFormHandler(player);
      break;

    case "straight16b":
    case "straight21b":
    case "straight50b":
      if (item.typeId === "minecraft:book") bridger.bridgerFormHandler(player);
      break;

    case "clutcher":
      if (item.typeId === "minecraft:book") clutcher.clutcherFormHandler(player);
      break;
  }
});

// player placing a block
mc.world.afterEvents.playerPlaceBlock.subscribe(({ player, block }) => {
  switch (dynamicProperty.getGameId()) {
    case "straight16b":
    case "straight21b":
    case "straight50b":
      bridger.placingBlockEvt(block);
      break;
    case "clutcher":
      clutcher.placingBlockEvt(block);
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

// world init
mc.world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent("auto:redstone", {
    onTick({ block }) {
      mc.world.getDimension("overworld").setBlockType(block.location, "auto:custom_redstoneBlock");
    },
  });
  blockComponentRegistry.registerCustomComponent("auto:clear", {
    onTick({ block }) {
      mc.world.getDimension("overworld").setBlockType(block.location, "minecraft:air");
    },
  });
});

/////////////////////////////////////////////////////////////////////////////////
// player joining the world
mc.world.afterEvents.playerSpawn.subscribe(({ player }) => {
  exp.teleportation(player, data.locationData.lobby);
  exp.giveItems(player, data.getInvData("lobby"));
});

// player leaving the worlds
mc.world.beforeEvents.playerLeave.subscribe(() => dynamicProperty.setGameId("lobby"));

// player breaking a block
mc.world.beforeEvents.playerBreakBlock.subscribe((e) => (e.cancel = true));

// interaction with block
// mc.world.beforeEvents.playerInteractWithBlock.subscribe((e) => (e.cancel = !e.block.isSolid));

/////////////////////////////////////////////////////////////////////////////////
// every tick
mc.system.runInterval(() => {
  switch (dynamicProperty.getGameId()) {
    case "straight16b":
    case "straight21b":
    case "straight50b":
      bridger.listener();
      break;
    case "clutcher":
      clutcher.listener();
      break;
  }
});

// every 10 tick
mc.system.runInterval(() => {
  switch (dynamicProperty.getGameId()) {
    case "clutcher":
      clutcher.slowListener();
      break;
  }
}, 10);
