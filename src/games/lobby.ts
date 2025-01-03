import { Player } from "@minecraft/server";

import { lobbyForm, lobbyCreditForm } from "../utilities/forms";
import { defineBridger } from "./bridger";
import { defineClutcher } from "./clutcher";
import * as exp from "../utilities/utilities";
import * as data from "../utilities/staticData";
import dynamicProperty from "../utilities/dynamicProperty";
import { BridgerDynamicID } from "models/DynamicProperty";
import TeleportationLocation from "models/TeleportationLocation";

export const nagivatorFormHandler = async function (player: Player) {
  const { selection } = await lobbyForm(player);

  // bridger
  if (selection === 1) {
    defineBridger(player);
    exp.giveItems(player, data.getInvData("straightBridger"));

    dynamicProperty.setGameId("straightBridger");
    exp.setBridgerMode(BridgerDynamicID.straight16blocks);
    exp.teleportation(player, <TeleportationLocation>data.locationData.straightBridger);
    exp.confirmMessage(player, "§7Teleporting to bridger...");
  }

  // clutcher
  if (selection === 3) {
    defineClutcher(player);
    exp.giveItems(player, data.getInvData("clutcher"));
    dynamicProperty.setGameId("clutcher");
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
  lobbyCreditForm(player);
};
