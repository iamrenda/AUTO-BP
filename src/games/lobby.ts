import * as form from "../forms/lobby";
import * as util from "../utilities/utilities";
import * as data from "../data/staticData";
import TeleportationLocation from "../models/TeleportationLocation";
import { generalTs, bridgerTs, parkourTs } from "../data/tempStorage";
import * as mc from "@minecraft/server";
import GameID from "../models/GameID";
import { ParkourChapterID } from "../models/DynamicProperty";
/**
 * if uncleared block detected, it shows the warning
 */
const warnUnclearedBlocks = function (player: mc.Player): void {
  if (generalTs.commonData["storedLocationsGameID"] !== generalTs.commonData["gameID"]) return;
  util.confirmMessage(`§a§lWe have detected uncleared blocks. Right-click on the book to clear them!!`);
  util.showTitleBar(player, "§cUncleared blocks Detected");
};

/**
 * handling navigation for lobby
 */
const handleNavigation = (player: mc.Player, gameId: GameID, locationData: TeleportationLocation) => {
  generalTs.commonData["gameID"] = gameId;
  util.giveItems(gameId);
  util.teleportation(locationData);
  warnUnclearedBlocks(player);
};

export const nagivatorFormHandler = async function (player: mc.Player) {
  const { selection } = await form.lobbyForm(player);

  // bridger
  if (selection === 11) {
    const { selection: bridgerDirSelection, canceled } = await form.formBridgerDirForm(player);

    if (canceled) return;

    if (bridgerDirSelection === 11) {
      handleNavigation(player, "straightBridger", data.locationData.straightBridger);
      bridgerTs.tempData["bridgerDirection"] = "straight";
    } else if (bridgerDirSelection === 15) {
      handleNavigation(player, "inclinedBridger", data.locationData.inclinedBridger);
      bridgerTs.tempData["bridgerDirection"] = "inclined";
    }
  }

  // clutcher
  if (selection === 13) handleNavigation(player, "clutcher", data.locationData.clutcher[0]);

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
  mc.system.runTimeout(() => {
    try {
      mc.world.getDimension("overworld").setBlockType(location, "auto:custom_redstoneBlock");
      generalTs.commonData["storedLocations"].delete(location);
    } catch (e) {}
  }, 60);
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
