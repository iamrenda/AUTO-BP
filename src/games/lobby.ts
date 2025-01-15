import { Player } from "@minecraft/server";
import * as form from "../forms/lobby";
import * as util from "../utilities/utilities";
import * as data from "../utilities/staticData";
import TeleportationLocation from "../models/TeleportationLocation";
import td from "../utilities/tempStorage";
import dp from "../utilities/dynamicProperty";
import { BridgerTicksID } from "../models/DynamicProperty";

export const nagivatorFormHandler = async function (player: Player) {
  const { selection } = await form.lobbyForm(player);

  // bridger
  if (selection === 1) {
    const { selection: bridgerDirSelection } = await form.formBridgerDirForm(player);

    if (bridgerDirSelection === 2) {
      td.setData("gameID", "straightBridger");
      td.setData("bridgerDirection", "straight");
    } else if (bridgerDirSelection === 6) {
      td.setData("gameID", "inclinedBridger");
      td.setData("bridgerDirection", "inclined");
    }
    dp.fetchData();
    util.confirmMessage(player, "§7Teleporting to bridger...");
    util.giveItems("straightBridger");
    util.setBridgerMode(BridgerTicksID[`${td.getData("bridgerDirection")}16blocks`]);
    util.teleportation(player, <TeleportationLocation>data.locationData[td.getData("gameID")]);
  }

  // clutcher
  if (selection === 3) {
    td.setData("gameID", "clutcher");
    util.giveItems("clutcher");
    util.confirmMessage(player, "§7Teleporting to bridger...");
    util.teleportation(player, data.locationData.clutcher[0]);
  }

  // wall run
  if (selection === 5) {
    td.setData("gameID", "wallRun");
    util.giveItems("wallRun");
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
