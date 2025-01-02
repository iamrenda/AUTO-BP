import * as mc from "@minecraft/server";
import * as exp from "../utilities/utilities";
import * as data from "../utilities/staticData";
import dynamicProperty from "../utilities/dynamicProperty";

import * as lobby from "../games/lobby";
import * as bridger from "../games/bridger";
import * as clutcher from "../games/clutcher";

import TeleportationLocation from "models/TeleportationLocation";
import { GameID } from "models/DynamicProperty";

// player right-click an item
mc.world.afterEvents.itemUse.subscribe(({ itemStack: item, source: player }): void => {
  switch (dynamicProperty.getGameId()) {
    case "lobby":
      if (item.typeId === "minecraft:compass") lobby.nagivatorFormHandler(player);
      if (item.typeId === "minecraft:stick") lobby.launchingHandler(player);
      if (item.typeId === "minecraft:book") lobby.creditFormHandler(player);
      break;

    case "straightBridger":
      if (item.typeId === "minecraft:book") bridger.bridgerFormHandler(player);
      break;

    case "clutcher":
      if (item.typeId === "minecraft:book") clutcher.clutcherFormHandler(player);
      break;
  }
});

// player placing a block
mc.world.afterEvents.playerPlaceBlock.subscribe(({ block }): void => {
  switch (dynamicProperty.getGameId()) {
    case "straightBridger":
      bridger.placingBlockEvt(block);
      break;
    case "clutcher":
      clutcher.placingBlockEvt(block);
      break;
  }
});

// player pushed a pressureplate
mc.world.afterEvents.pressurePlatePush.subscribe((): void => {
  switch (dynamicProperty.getGameId()) {
    case "straightBridger":
      bridger.pressurePlatePushEvt();
      break;
  }
});

// world init
mc.world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }): void => {
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
mc.world.afterEvents.playerSpawn.subscribe(({ player }): void => {
  exp.teleportation(player, <TeleportationLocation>data.locationData[GameID.lobby]);
  exp.giveItems(player, data.getInvData(GameID.lobby));
});

// player leaving the worlds
mc.world.beforeEvents.playerLeave.subscribe((): void => dynamicProperty.setGameId(GameID.lobby));

// player breaking a block
// mc.world.beforeEvents.playerBreakBlock.subscribe((e) => (e.cancel = true));

// interaction with block
// mc.world.beforeEvents.playerInteractWithBlock.subscribe((e) => (e.cancel = !e.block.isSolid));

/////////////////////////////////////////////////////////////////////////////////
// every tick
mc.system.runInterval((): void => {
  switch (dynamicProperty.getGameId()) {
    case "straightBridger":
      bridger.listener();
      break;
    case "clutcher":
      clutcher.listener();
      break;
  }
});

// every 10 tick
mc.system.runInterval((): void => {
  switch (dynamicProperty.getGameId()) {
    case "clutcher":
      clutcher.slowListener();
      break;
  }
}, 10);
