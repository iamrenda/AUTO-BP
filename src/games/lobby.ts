import * as form from "../forms/lobby";
import * as util from "../utilities/utilities";
import * as data from "../data/staticData";
import TeleportationLocation from "../models/TeleportationLocation";
import { generalTs, bridgerTs } from "../data/tempStorage";
import { Player } from "@minecraft/server";
import GameID from "../models/GameID";

/**
 * if uncleared block detected, it shows the warning
 */
const warnUnclearedBlocks = function (player: Player): void {
  if (generalTs.commonData["storedLocationsGameID"] !== generalTs.commonData["gameID"]) return;
  util.confirmMessage(`§a§lWe have detected uncleared blocks. Right-click on the book to clear them!!`);
  util.showTitleBar(player, "§cUncleared blocks Detected");
};

/**
 * handling navigation for lobby
 */
const handleNavigation = (player: Player, gameId: GameID, locationData: TeleportationLocation) => {
  generalTs.commonData["gameID"] = gameId;
  util.giveItems(gameId);
  util.teleportation(locationData);
  warnUnclearedBlocks(player);
};

export const nagivatorFormHandler = async function (player: Player) {
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
      util.displayScoreboard("normalFistReduce");
      handleNavigation(player, "normalFistReduce", data.locationData.normalFistReduce);
    } else if (bridgerDirSelection === 15) {
      util.displayScoreboard("limitlessFistReduce");
      handleNavigation(player, "limitlessFistReduce", data.locationData.limitlessFistReduce);
    }
  }

  // back to lobby
  if (selection === 31) util.teleportation(data.locationData.lobby);
};

export const launchingStickHandler = function (player: Player) {
  const { x: directionX, y: directionY, z: directionZ } = player.getViewDirection();

  player.applyKnockback(directionX, directionZ, 7, 2 * (1 + directionY));
  player.playSound("breeze_wind_charge.burst", { location: player.location });
  player.spawnParticle("minecraft:huge_explosion_emitter", player.location);
};

export const creditFormHandler = function (player: Player) {
  form.lobbyCreditForm(player);
};
