import * as form from "../forms/lobby";
import * as util from "../utilities/utilities";
import * as data from "../data/staticData";
import TeleportationLocation from "../models/TeleportationLocation";
import { generalTs, bridgerTs, parkourTs } from "../data/tempStorage";
import * as mc from "@minecraft/server";
import GameID from "../models/GameID";
import { BridgerTypesID, ParkourChapterID } from "../models/DynamicProperty";
import { GameData } from "../data/dynamicProperty";

/**
 * handling navigation for lobby
 */
const handleNavigation = (player: mc.Player, gameId: GameID, locationData: TeleportationLocation) => {
  generalTs.clearBlocks();
  generalTs.commonData["gameID"] = gameId;
  util.giveItems(gameId);
  util.teleportation(locationData);
  util.warnUnclearedBlocks(player);
};

export const nagivatorFormHandler = async function (player: mc.Player) {
  const { selection } = await form.lobbyForm(player);

  // bridger
  if (selection === 11) {
    const { selection: bridgerDirSelection, canceled } = await form.formBridgerDirForm(player);

    if (canceled) return;

    if (bridgerDirSelection === 11) {
      const distance = GameData.getData("Distance", "straight");

      bridgerTs.tempData["bridgerDirection"] = "straight";
      bridgerTs.tempData["bridgerMode"] = <BridgerTypesID>`straight${distance}blocks`;
      handleNavigation(player, "straightBridger", data.locationData.straightBridger);
    } else if (bridgerDirSelection === 15) {
      const distance = GameData.getData("Distance", "inclined");

      bridgerTs.tempData["bridgerDirection"] = "inclined";
      bridgerTs.tempData["bridgerMode"] = <BridgerTypesID>`inclined${distance}blocks`;
      handleNavigation(player, "inclinedBridger", data.locationData.inclinedBridger);
    }
  }

  // clutcher
  if (selection === 13) {
    generalTs.commonData["byPass"] = true;
    player.setGameMode(mc.GameMode.creative);
    player.setGameMode(9);
    generalTs.commonData["byPass"] = false;
    handleNavigation(player, "clutcher", data.locationData.clutcher);
    util.sendMessage("§aYou are able to fly in survival mode, but this is an intended phenomenon.", "note.bell");
  }

  // wall run
  if (selection === 15) handleNavigation(player, "wallRun", data.locationData.wallRun);

  // bedwars rush
  if (selection === 21) handleNavigation(player, "bedwarsRush", data.locationData.bedwarsRush);

  // fist reduce
  if (selection === 23) {
    const { selection: bridgerDirSelection, canceled } = await form.fistReduceModeForm(player);
    if (canceled) return;

    if (bridgerDirSelection === 11) {
      handleNavigation(player, "normalFistReduce", data.locationData.normalFistReduce);
      util.displayScoreboard("normalFistReduce");
    } else if (bridgerDirSelection === 15) {
      handleNavigation(player, "limitlessFistReduce", data.locationData.limitlessFistReduce);
      util.displayScoreboard("limitlessFistReduce");
    }
  }

  // parkour
  if (selection === 31) {
    const { selection: bridgerDirSelection, canceled } = await form.parkourChapterForm(player);
    if (canceled) return;

    if (bridgerDirSelection === 11) {
      parkourTs.tempData["chapter"] = ParkourChapterID.chapter1_1;
      handleNavigation(player, "parkour1_1", data.locationData["parkour1_1"]);
    } else if (bridgerDirSelection === 13) {
      parkourTs.tempData["chapter"] = ParkourChapterID.chapter1_2;
      handleNavigation(player, "parkour1_2", data.locationData["parkour1_2"]);
    } else if (bridgerDirSelection === 15) {
      parkourTs.tempData["chapter"] = ParkourChapterID.chapter1_3;
      handleNavigation(player, "parkour1_3", data.locationData["parkour1_3"]);
    }
  }
};

export const placingBlockEvt = function ({ location }: { location: mc.Vector3 }) {
  const i = new mc.ItemStack("minecraft:white_wool", 1);
  i.lockMode = mc.ItemLockMode.inventory;
  generalTs.commonData["player"].getComponent("inventory").container.addItem(i);
  bridgerTs.commonData["storedLocations"].add(location);

  mc.system.runTimeout(() => {
    try {
      mc.world.getDimension("overworld").setBlockType(location, "auto:custom_redstoneBlock");
      generalTs.commonData["storedLocations"].delete(location);
    } catch (e) {}
  }, 40);
};

export const launchingStickHandler = function (player: mc.Player) {
  const { x: directionX, y: directionY, z: directionZ } = player.getViewDirection();

  player.applyKnockback(directionX, directionZ, 7, 2 * (1 + directionY));
  player.playSound("breeze_wind_charge.burst", { location: player.location });
  player.spawnParticle("minecraft:huge_explosion_emitter", player.location);
};

export const creditFormHandler = function (player: mc.Player) {
  form.lobbyCreditForm(player);
};
