import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import * as lobby from "../games/lobby";
import * as bridger from "../games/bridger";
import * as clutcher from "../games/clutcher";
import * as wallRun from "../games/wallrun";
import * as bedwarsRush from "../games/bedwarsRush";
import * as fistReduce from "../games/fistReduce";
import { bridgerTs, generalTs } from "../data/tempStorage";
import { DynamicProperty, StoredBlocksClass } from "../data/dynamicProperty";
import GameID from "../models/GameID";

const eatGhead = (player: mc.Player): void => {
  player.addEffect("minecraft:regeneration", 100, { amplifier: 4 });
  player.addEffect("minecraft:absorption", 2400, { amplifier: 1 });
  player.addEffect("minecraft:speed", 320, { amplifier: 2 });
  player.playSound("random.burp");
  util.confirmMessage(
    "§2You ate a §6Golden Head §2and gained 5 seconds of regeneration IIII and 2 minutes of Absorption!"
  );
  util.confirmMessage("§2You also gained 16 seconds of Speed II!");

  const container = player.getComponent("inventory").container;
  const slot = player.selectedSlotIndex;
  container.setItem(slot, undefined);
};

// right-click an item
type ItemTypeHandlers = { [key: string]: (player: mc.Player) => void };

mc.world.afterEvents.itemUse.subscribe(({ itemStack: item, source: player }): void => {
  // ghead
  if (item.typeId === "auto:ghead") return eatGhead(player);

  const gameID = generalTs.commonData["gameID"];
  const storedGameID = generalTs.commonData["storedLocationsGameID"];

  const itemTypeHandlers: ItemTypeHandlers = {
    "minecraft:compass": lobby.nagivatorFormHandler,
    "minecraft:stick": lobby.launchingStickHandler,
    "minecraft:book": (player: mc.Player) => {
      if (storedGameID === gameID) util.clearBlocks(player);
      else {
        const formHandlers: { [key in GameID]: (player: mc.Player) => void } = {
          lobby: lobby.creditFormHandler,
          straightBridger: bridger.bridgerFormHandler,
          inclinedBridger: bridger.bridgerFormHandler,
          clutcher: clutcher.clutcherFormHandler,
          wallRun: wallRun.wallRunFormHandler,
          bedwarsRush: bedwarsRush.bedWarsRushFormHandler,
          normalFistReduce: fistReduce.fistReduceFormHandler,
          limitlessFistReduce: fistReduce.fistReduceFormHandler,
        };
        formHandlers[gameID](player);
      }
    },
  };

  if (itemTypeHandlers[item.typeId]) itemTypeHandlers[item.typeId](player);
});

// placing a block
const eventMap: { [key: string]: (block: any) => void } = {
  straightBridger: bridger.placingBlockEvt,
  inclinedBridger: bridger.placingBlockEvt,
  clutcher: clutcher.placingBlockEvt,
  wallRun: wallRun.placingBlockEvt,
  bedwarsRush: bedwarsRush.placingBlockEvt,
  normalFistReduce: fistReduce.placingBlockEvt,
  limitlessFistReduce: fistReduce.placingBlockEvt,
};
mc.world.afterEvents.playerPlaceBlock.subscribe(({ block }): void => {
  const eventHandler = eventMap[generalTs.commonData["gameID"]];
  if (eventHandler) eventHandler(block);
});

// pushed a pressureplate
mc.world.afterEvents.pressurePlatePush.subscribe(({ source: player, block }): void => {
  switch (generalTs.commonData["gameID"]) {
    case "straightBridger":
    case "inclinedBridger":
      bridger.pressurePlatePushEvt(<mc.Player>player);
      break;
    case "wallRun":
      wallRun.pressurePlatePushEvt(block);
      break;
  }
});

// world init
mc.world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }): void => {
  blockComponentRegistry.registerCustomComponent("auto:clear", {
    onTick({ block }) {
      mc.world.getDimension("overworld").setBlockType(block.location, "minecraft:air");
    },
  });
});

// joining the world
mc.world.afterEvents.playerSpawn.subscribe(({ player }): void => {
  generalTs.commonData["player"] = player;
  generalTs.commonData["storedLocationsGameID"] = <GameID>mc.world.getDynamicProperty("auto:storedBlocksGameID");
  DynamicProperty.fetchData();
  util.backToLobbyKit(player, generalTs);
});

// leaving the world
mc.world.beforeEvents.playerLeave.subscribe(() => {
  DynamicProperty.postData();
  if (generalTs.commonData["storedLocations"].size) {
    StoredBlocksClass.storeBlocks();
    generalTs.commonData["storedLocationsGameID"] = generalTs.commonData["gameID"];
  }
});

// chat message
mc.world.beforeEvents.chatSend.subscribe((event) => {
  const { message, sender: player } = event;

  if (message.includes("AUTO!") && generalTs.commonData["gameID"] === "lobby") {
    event.cancel = true;

    mc.system.run(() => {
      util.confirmMessage("§aHaha, thanks for playing this world. This is a present for you!");
      util.confirmMessage("§aYou have §63 Golden Heads§a in your inventory!", "random.totem");
      const container = player.getComponent("inventory").container;
      for (let i = 1; i <= 3; i++) container.addItem(new mc.ItemStack("auto:ghead", 1));
    });
    return;
  }
});

// interaction with block
// mc.world.beforeEvents.playerInteractWithBlock.subscribe((e) => (e.cancel = !e.block.isSolid));

// breaking a block (before event)
const hasCoordinates = function (loc: mc.Vector3) {
  return [...bridgerTs.commonData["storedLocations"]].some(
    (item) => item.x === loc.x && item.y === loc.y && item.z === loc.z
  );
};

// breaking a block (after event)
mc.world.beforeEvents.playerBreakBlock.subscribe((e) => {
  switch (generalTs.commonData["gameID"]) {
    case "straightBridger":
    case "inclinedBridger":
      if (hasCoordinates(e.block.location)) e.cancel = false;
      else e.cancel = true;
      break;

    case "bedwarsRush":
      if (e.block.typeId === "minecraft:bed") bedwarsRush.breakingBlockEvt(e.player);
      e.cancel = true;
      break;

    default:
    // e.cancel = true;
  }
});

// entity attack
mc.world.afterEvents.entityHurt.subscribe(({ hurtEntity, damageSource }) => {
  if (generalTs.commonData["gameID"] === "normalFistReduce" || generalTs.commonData["gameID"] === "limitlessFistReduce")
    fistReduce.fistReduceAttackEvt(hurtEntity, damageSource);
});

/////////////////////////////////////////////////////////////////////////////////
// every tick
const listenerMap: { [key: string]: () => void } = {
  straightBridger: bridger.listener,
  inclinedBridger: bridger.listener,
  clutcher: clutcher.listener,
  wallRun: wallRun.listener,
  bedwarsRush: bedwarsRush.listener,
};
mc.system.runInterval((): void => {
  const listener = listenerMap[generalTs.commonData["gameID"]];
  if (listener) listener();
});

// every 10 tick
mc.system.runInterval((): void => {
  switch (generalTs.commonData["gameID"]) {
    case "clutcher":
      clutcher.slowListener();
      break;
    case "normalFistReduce":
      fistReduce.slowListener("normal");
      break;
    case "limitlessFistReduce":
      fistReduce.slowListener("limitless");
      break;
  }
}, 10);
