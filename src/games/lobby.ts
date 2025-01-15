import { Player } from "@minecraft/server";
import * as form from "../forms/lobby";
import * as util from "../utilities/utilities";
import * as data from "../utilities/staticData";
import TeleportationLocation from "../models/TeleportationLocation";
import tempData from "../utilities/tempData";
import { BridgerTicksID } from "../models/DynamicProperty";
import DynamicProperty from "../utilities/dynamicProperty";

export const nagivatorFormHandler = async function (player: Player) {
  const { selection } = await form.lobbyForm(player);

  // bridger
  if (selection === 1) {
    const { selection: bridgerDirSelection } = await form.formBridgerDirForm(player);

    if (bridgerDirSelection === 2) {
      tempData.gameID = "straightBridger";
      tempData.bridgerDirection = "straight";
    } else if (bridgerDirSelection === 6) {
      tempData.gameID = "inclinedBridger";
      tempData.bridgerDirection = "inclined";
    }
    DynamicProperty.fetchData();
    util.confirmMessage(player, "§7Teleporting to bridger...");
    util.giveItems(player, data.getInvData(tempData.gameID));
    util.setBridgerMode(BridgerTicksID[`${tempData.bridgerDirection}16blocks`]);
    util.teleportation(player, <TeleportationLocation>data.locationData[tempData.gameID]);
  }

  // clutcher
  if (selection === 3) {
    tempData.gameID = "clutcher";
    util.giveItems(player, data.getInvData("clutcher"));
    util.confirmMessage(player, "§7Teleporting to bridger...");
    util.teleportation(player, data.locationData.clutcher[0]);
  }

  // wall run
  if (selection === 5) {
    tempData.gameID = "wallRun";
    util.giveItems(player, data.getInvData("wallRun"));
    util.confirmMessage(player, "§7Teleporting to bridger...");
    util.teleportation(player, <TeleportationLocation>data.locationData.wallRun);
  }

  // back to lobby
  if (selection === 7) util.teleportation(player, <TeleportationLocation>data.locationData.lobby);
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
