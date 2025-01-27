import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import * as lobby from "../games/lobby";
import * as bridger from "../games/bridger";
import * as clutcher from "../games/clutcher";
import * as wallRun from "../games/wallrun";
import * as bedwarsRush from "../games/bedwarsRush";
import { generalTs } from "../data/tempStorage";
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
mc.world.afterEvents.itemUse.subscribe(({ itemStack: item, source: player }): void => {
  // ghead
  if (item.typeId === "auto:ghead") eatGhead(player);

  switch (generalTs.commonData["gameID"]) {
    case "lobby":
      if (item.typeId === "minecraft:compass") lobby.nagivatorFormHandler(player);
      if (item.typeId === "minecraft:stick") lobby.launchingHandler(player);
      if (item.typeId === "minecraft:book") lobby.creditFormHandler(player);
      break;

    case "straightBridger":
    case "inclinedBridger":
      if (item.typeId === "minecraft:book")
        generalTs.commonData["storedLocationsGameID"] === generalTs.commonData["gameID"]
          ? util.clearBlocks(player)
          : bridger.bridgerFormHandler(player);
      break;

    case "clutcher":
      if (item.typeId === "minecraft:book")
        generalTs.commonData["storedLocationsGameID"] === generalTs.commonData["gameID"]
          ? util.clearBlocks(player)
          : clutcher.clutcherFormHandler(player);
      break;

    case "wallRun":
      if (item.typeId === "minecraft:book")
        generalTs.commonData["storedLocationsGameID"] === generalTs.commonData["gameID"]
          ? util.clearBlocks(player)
          : wallRun.wallRunFormHandler(player);
      break;

    case "bedwarsRush":
      if (item.typeId === "minecraft:book")
        generalTs.commonData["storedLocationsGameID"] === generalTs.commonData["gameID"]
          ? util.clearBlocks(player)
          : bedwarsRush.bedWarsRushFormHandler(player);
      break;
  }
});

// placing a block
mc.world.afterEvents.playerPlaceBlock.subscribe(({ block }): void => {
  switch (generalTs.commonData["gameID"]) {
    case "straightBridger":
    case "inclinedBridger":
      bridger.placingBlockEvt(block);
      break;
    case "clutcher":
      clutcher.placingBlockEvt(block);
      break;
    case "wallRun":
      wallRun.placingBlockEvt(block);
      break;
    case "bedwarsRush":
      bedwarsRush.placingBlockEvt(block);
      break;
  }
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

/////////////////////////////////////////////////////////////////////////////////
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
  generalTs.commonData["storedLocationsGameID"] = <GameID>(
    mc.world.getDynamicProperty("auto:storedBlocksGameID")
  );
  DynamicProperty.fetchData();
  util.backToLobbyKit(player);
});

// leaving the world
mc.world.beforeEvents.playerLeave.subscribe(() => {
  if (generalTs.commonData["storedLocations"].size) {
    StoredBlocksClass.storeBlocks();
    generalTs.commonData["storedLocationsGameID"] = generalTs.commonData["gameID"];
  }
  DynamicProperty.postData();
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
mc.world.beforeEvents.playerBreakBlock.subscribe((e) => {
  // e.cancel = true;
  switch (generalTs.commonData["gameID"]) {
    case "bedwarsRush":
      if (e.block.typeId === "minecraft:bed") bedwarsRush.breakingBlockEvt(e.player);
      break;
  }
});

/////////////////////////////////////////////////////////////////////////////////
// every tick
mc.system.runInterval((): void => {
  switch (generalTs.commonData["gameID"]) {
    case "straightBridger":
    case "inclinedBridger":
      bridger.listener();
      break;
    case "clutcher":
      clutcher.listener();
      break;
    case "wallRun":
      wallRun.listener();
      break;
    case "bedwarsRush":
      bedwarsRush.listener();
      break;
  }
});

// every 10 tick
mc.system.runInterval((): void => {
  switch (generalTs.commonData["gameID"]) {
    case "clutcher":
      clutcher.slowListener();
      break;
  }
}, 10);
