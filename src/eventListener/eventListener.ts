import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import * as lobby from "../games/lobby";
import * as bridger from "../games/bridger";
import * as clutcher from "../games/clutcher";
import * as wallRun from "../games/wallRun";
import * as bedwarsRush from "../games/bedwarsRush";
import * as fistReduce from "../games/fistReduce";
import * as parkour from "../games/parkour";
import * as woolParkour from "../games/woolParkour";

import GameID, { BundlableGameID, ParentGameID } from "../models/GameID";
import { generalTs, bridgerTs } from "../data/tempStorage";
import { DynamicProperty, gameData, StoredBlocksClass } from "../data/dynamicProperty";
import { statsForm } from "../forms/utility";

//////////////////////////////////////////////////////////////////////
const eatGhead = (player: mc.Player): void => {
  player.addEffect("minecraft:regeneration", 100, { amplifier: 4 });
  player.addEffect("minecraft:absorption", 2400, { amplifier: 1 });
  player.addEffect("minecraft:speed", 320, { amplifier: 2 });
  player.playSound("random.burp");
  util.sendMessage(
    "§2You ate a §6Golden Head §2and gained 5 seconds of regeneration IIII and 2 minutes of Absorption!"
  );
  util.sendMessage("§2You also gained 16 seconds of Speed II!");

  const container = player.getComponent("inventory").container;
  const slot = player.selectedSlotIndex;
  container.setItem(slot, undefined);
};

const hasCoordinates = function (loc: mc.Vector3) {
  return [...bridgerTs.commonData["storedLocations"]].some(
    (item) => item.x === loc.x && item.y === loc.y && item.z === loc.z
  );
};

const formHandlers: Record<ParentGameID, (player: mc.Player) => void> = {
  Lobby: lobby.creditFormHandler,
  Bridger: bridger.bridgerFormHandler,
  Clutcher: clutcher.clutcherFormHandler,
  Wall_Run: wallRun.wallRunFormHandler,
  Bedwars_Rush: bedwarsRush.bedWarsRushFormHandler,
  Fist_Reduce: fistReduce.fistReduceFormHandler,
  Parkour: parkour.parkourFormHandler,
  Wool_Parkour: woolParkour.parkourFormHandler,
};

const blockPlaceEvts: Record<ParentGameID, (block: mc.Block) => void> = {
  Lobby: undefined,
  Bridger: bridger.placingBlockEvt,
  Clutcher: clutcher.placingBlockEvt,
  Wall_Run: wallRun.placingBlockEvt,
  Bedwars_Rush: bedwarsRush.placingBlockEvt,
  Fist_Reduce: fistReduce.placingBlockEvt,
  Parkour: undefined,
  Wool_Parkour: woolParkour.placingBlockEvt,
};

const pressurePlatePushes: Record<ParentGameID, (e: mc.PressurePlatePushAfterEvent) => void> = {
  Lobby: undefined,
  Bridger: bridger.pressurePlatePushEvt,
  Clutcher: undefined,
  Wall_Run: wallRun.pressurePlatePushEvt,
  Bedwars_Rush: undefined,
  Fist_Reduce: undefined,
  Parkour: parkour.pressurePlatePushEvt,
  Wool_Parkour: woolParkour.pressurePlatePushEvt,
};

const listeners: Record<ParentGameID, () => void> = {
  Lobby: undefined,
  Bridger: bridger.listener,
  Clutcher: clutcher.listener,
  Wall_Run: wallRun.listener,
  Bedwars_Rush: bedwarsRush.listener,
  Fist_Reduce: undefined,
  Parkour: parkour.listener,
  Wool_Parkour: woolParkour.listener,
};

//////////////////////////////////////////////////////////////////////

// right-click an item
mc.world.afterEvents.itemUse.subscribe(({ itemStack: item, source: player }): void | Promise<void> => {
  if (item.typeId === "auto:ghead") return eatGhead(player);

  switch (item.typeId) {
    case "minecraft:stick":
      return lobby.launchingStickHandler(player);

    case "minecraft:compass":
      return lobby.nagivatorFormHandler(player);

    case "minecraft:book":
      const parentGameIDa = util.getCurrentParentCategory();
      return formHandlers[parentGameIDa](player);

    case "minecraft:flint":
      util.teleportation("Lobby");
      mc.system.run(() => player.playSound("mob.endermen.portal"));
      break;

    case "minecraft:paper":
      const parentGameIDb = <BundlableGameID>util.getCurrentParentCategory();
      statsForm(player, parentGameIDb);
      break;
  }
});

// place blocks
mc.world.afterEvents.playerPlaceBlock.subscribe(({ block }): void => {
  const parentGameID = util.getCurrentParentCategory();
  const eventHandler = blockPlaceEvts[parentGameID];
  if (eventHandler) {
    eventHandler(block);
  }
});

// breaking a block (before event)
mc.world.beforeEvents.playerBreakBlock.subscribe((e) => {
  const parentGameID = util.getCurrentParentCategory();

  switch (parentGameID) {
    case "Bridger":
      if (hasCoordinates(e.block.location)) e.cancel = false;
      else e.cancel = true;
      break;

    case "Bedwars_Rush":
      if (e.block.typeId === "minecraft:bed") bedwarsRush.breakingBlockEvt(e.player);
      e.cancel = true;
      break;

    default:
    //   e.cancel = true;
  }
});

// pushed a pressureplate
mc.world.afterEvents.pressurePlatePush.subscribe((e): void => {
  const parentGameID = util.getCurrentParentCategory();
  if (pressurePlatePushes[parentGameID]) {
    pressurePlatePushes[parentGameID](e);
  }
});

// pressureplate pop
mc.world.afterEvents.pressurePlatePop.subscribe(({ block }) => {
  const parentGameID = util.getCurrentParentCategory();

  switch (parentGameID) {
    case "Wool_Parkour":
      woolParkour.pressurePlatePopEvt(block);
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
  gameData.postData();
  if (generalTs.commonData["storedLocations"].size) {
    StoredBlocksClass.storeBlocks();
    generalTs.commonData["storedLocationsGameID"] = generalTs.commonData["gameID"];
  }
});

// chat message
mc.world.beforeEvents.chatSend.subscribe((event) => {
  const { message, sender: player } = event;

  if (message.includes("AUTO!") && generalTs.commonData["gameID"] === "Lobby") {
    event.cancel = true;

    mc.system.run(() => {
      util.sendMessage("§aHaha, thanks for playing this world. This is a present for you!");
      util.sendMessage("§aYou have §63 Golden Heads§a in your inventory!", "random.totem");
      const container = player.getComponent("inventory").container;
      for (let i = 1; i <= 3; i++) container.addItem(new mc.ItemStack("auto:ghead", 1));
    });
    return;
  }
});

// entity attack
mc.world.afterEvents.entityHurt.subscribe(({ hurtEntity, damageSource }) => {
  if (
    generalTs.commonData["gameID"] === "Fist_Reduce$Normal" ||
    generalTs.commonData["gameID"] === "Fist_Reduce$LIMITLESS"
  )
    fistReduce.fistReduceAttackEvt(hurtEntity, damageSource);
});

// right-click npc
mc.world.beforeEvents.playerInteractWithEntity.subscribe((e) => {
  if (e.target.typeId !== "auto:customnpc") return;
  e.cancel = true;

  const parentGameID = <BundlableGameID>util.getCurrentParentCategory();
  mc.system.run(async () => await statsForm(e.player, parentGameID));
});

// block interaction
mc.world.beforeEvents.playerInteractWithBlock.subscribe(
  (e) => (e.cancel = !e.player.isSneaking && e.block.hasTag("one_way_collidable"))
);

// gamemode change
// mc.world.afterEvents.playerGameModeChange.subscribe(({ toGameMode, player }) => {
//   if (!generalTs.commonData["byPass"] && toGameMode === mc.GameMode.creative) {
//     const gameMode = generalTs.commonData["gameID"] === "clutcher" ? 9 : mc.GameMode.survival;
//     player.setGameMode(gameMode);
//   }
// });

/////////////////////////////////////////////////////////////////////////////////
// every tick
mc.system.runInterval((): void => {
  const parentGameID = util.getCurrentParentCategory();
  const listener = listeners[parentGameID];
  if (listener) listener();
});

// every 10 tick
mc.system.runInterval((): void => {
  switch (generalTs.commonData["gameID"]) {
    case "Clutcher":
      clutcher.slowListener();
      break;
    case "Fist_Reduce$Normal":
      fistReduce.slowListener("normal");
      break;
    case "Fist_Reduce$LIMITLESS":
      fistReduce.slowListener("limitless");
      break;
  }
}, 10);

mc.system.runInterval(DynamicProperty.postData, 600);
