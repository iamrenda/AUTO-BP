import * as mc from "@minecraft/server";
import * as exp from "./functions.js";
import * as data from "./data.js";

import * as lobby from "../games/lobby.js";
import * as bridger from "../games/bridger.js";

// player right-click an item
mc.world.afterEvents.itemUse.subscribe(
  ({ itemStack: item, source: player }) => {
    switch (exp.getGameId()) {
      case "lobby":
        if (item.typeId === "minecraft:compass")
          lobby.nagivatorFormHandler(player);
        break;

      case "bridger":
        if (item.typeId === "minecraft:book")
          bridger.bridgerFormHandler(player);
        break;
    }
  }
);

// player placing a block
mc.world.afterEvents.playerPlaceBlock.subscribe(({ block }) => {
  switch (exp.getGameId()) {
    case "lobby":
      break;
    case "bridger":
      bridger.placingBlockEvt(block);
      break;
  }
});

// player pushed a pressureplate
mc.world.afterEvents.pressurePlatePush.subscribe(() => {
  switch (exp.getGameId()) {
    case "lobby":
      break;
    case "bridger":
      bridger.pressurePlatePushEvt();
      break;
  }
});

/////////////////////////////////////////////////////////////////////////////////
// player joining the world
mc.world.afterEvents.playerSpawn.subscribe(({ player }) => {
  bridger.defineVariable(player);
  exp.teleportation(player, data.locationData.lobby);
  exp.giveItems(player, [{ item: "minecraft:compass", quantity: 1, slot: 4 }]);
});

// player leaving the world
mc.world.beforeEvents.playerLeave.subscribe(() => exp.setGameId("lobby"));

/////////////////////////////////////////////////////////////////////////////////
// every tick
mc.system.runInterval(() => {
  switch (exp.getGameId()) {
    case "lobby":
      break;
    case "bridger":
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
