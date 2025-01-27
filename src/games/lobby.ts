import * as form from "../forms/lobby";
import * as util from "../utilities/utilities";
import * as data from "../data/staticData";
import TeleportationLocation from "../models/TeleportationLocation";
import { bridgerTs, clutcherTs, generalTs, wallRunTs } from "../data/tempStorage";
import { Player } from "@minecraft/server";
import { BridgerTicksID } from "../models/DynamicProperty";

/**
 * if uncleared block detected, it shows the warning
 */
const warnUnclearedBlocks = function (player: Player): void {
  if (generalTs.commonData["storedLocationsGameID"] !== generalTs.commonData["gameID"]) return;
  util.confirmMessage(
    `§a§lWe have detected uncleared blocks. Right-click on the book to clear them!!`
  );
  util.showTitleBar(player, "§cUncleared blocks Detected");
};

export const nagivatorFormHandler = async function (player: Player) {
  const { selection } = await form.lobbyForm(player);

  // bridger
  if (selection === 11) {
    const { selection: bridgerDirSelection, canceled } = await form.formBridgerDirForm(player);

    if (canceled) return;

    if (bridgerDirSelection === 11) {
      bridgerTs.commonData["gameID"] = "straightBridger";
      bridgerTs.tempData["bridgerDirection"] = "straight";
    } else if (bridgerDirSelection === 15) {
      bridgerTs.commonData["gameID"] = "inclinedBridger";
      bridgerTs.tempData["bridgerDirection"] = "inclined";
    }
    util.setBridgerMode(BridgerTicksID[`${bridgerTs.tempData["bridgerDirection"]}16blocks`]);
    util.giveItems("straightBridger");
    util.confirmMessage("§7Teleporting to Bridger...");
    util.teleportation(<TeleportationLocation>data.locationData[bridgerTs.commonData["gameID"]]);
    warnUnclearedBlocks(player);
  }

  // clutcher
  if (selection === 13) {
    clutcherTs.commonData["gameID"] = "clutcher";
    util.giveItems("clutcher");
    util.confirmMessage("§7Teleporting to Clutcher...");
    util.teleportation(data.locationData.clutcher[0]);
    warnUnclearedBlocks(player);
  }

  // wall run
  if (selection === 15) {
    wallRunTs.commonData["gameID"] = "wallRun";
    util.giveItems("wallRun");
    util.confirmMessage("§7Teleporting to Wall Run...");
    util.teleportation(<TeleportationLocation>data.locationData.wallRun);
    warnUnclearedBlocks(player);
  }

  // bedwars rush
  if (selection === 21) {
    wallRunTs.commonData["gameID"] = "bedwarsRush";
    util.giveItems("bedwarsRush");
    util.confirmMessage("§7Teleporting to Wall Run...");
    util.teleportation(<TeleportationLocation>data.locationData.bedwarsRush);
    warnUnclearedBlocks(player);
  }

  // back to lobby
  if (selection === 23) util.teleportation(<TeleportationLocation>data.locationData.lobby);
};

export const launchingHandler = function (player: Player) {
  const { x: directionX, y: directionY, z: directionZ } = player.getViewDirection();

  player.applyKnockback(directionX, directionZ, 7, 2 * (1 + directionY));
  player.playSound("breeze_wind_charge.burst", { location: player.location });
  player.spawnParticle("minecraft:huge_explosion_emitter", player.location);
};

export const creditFormHandler = function (player: Player) {
  form.lobbyCreditForm(player);
};
