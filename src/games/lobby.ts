import { Player } from "@minecraft/server";

import * as form from "../forms/lobby";
import { bridgerHandler } from "./bridger";
import { defineClutcher } from "./clutcher";
import * as exp from "../utilities/utilities";
import * as data from "../utilities/staticData";
import TeleportationLocation from "models/TeleportationLocation";
import tempData from "utilities/tempData";

export const nagivatorFormHandler = async function (player: Player) {
  const { selection } = await form.lobbyForm(player);

  // bridger
  if (selection === 1) {
    // bridger direction
    const { selection: bridgerDirSelection } = await form.formBridgerDirForm(player);

    if (bridgerDirSelection === 2) bridgerHandler(player, "straightBridger");
    else if (bridgerDirSelection === 6) bridgerHandler(player, "inclinedBridger");
  }

  // clutcher
  if (selection === 3) {
    defineClutcher(player);
    exp.giveItems(player, data.getInvData("clutcher"));
    tempData.gameID = "clutcher";
    exp.confirmMessage(player, "§7Teleporting to bridger...");
    exp.teleportation(player, data.locationData.clutcher[0]);
  }

  // back to lobby
  if (selection === 7) exp.teleportation(player, <TeleportationLocation>data.locationData.lobby);
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
