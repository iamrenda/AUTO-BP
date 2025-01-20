import * as form from "../forms/lobby";
import * as util from "../utilities/utilities";
import * as data from "../data/staticData";
import TeleportationLocation from "../models/TeleportationLocation";
import { bridgerTs, clutcherTs, wallRunTs } from "../data/tempStorage";
import { Player } from "@minecraft/server";
import { BridgerTicksID } from "../models/DynamicProperty";
import { DynamicProperty } from "../data/dynamicProperty";

export const nagivatorFormHandler = async function (player: Player) {
  const { selection } = await form.lobbyForm(player);

  // bridger
  if (selection === 1) {
    const { selection: bridgerDirSelection, canceled } = await form.formBridgerDirForm(player);

    if (canceled) return;

    if (bridgerDirSelection === 2) {
      bridgerTs.commonData["gameID"] = "straightBridger";
      bridgerTs.tempData["bridgerDirection"] = "straight";
    } else if (bridgerDirSelection === 6) {
      bridgerTs.commonData["gameID"] = "inclinedBridger";
      bridgerTs.tempData["bridgerDirection"] = "inclined";
    }
    DynamicProperty.postData();
    util.confirmMessage("§7Teleporting to bridger...");
    util.giveItems("straightBridger");
    util.setBridgerMode(BridgerTicksID[`${bridgerTs.tempData["bridgerDirection"]}16blocks`]);
    util.teleportation(<TeleportationLocation>data.locationData[bridgerTs.commonData["gameID"]]);
  }

  // clutcher
  if (selection === 3) {
    clutcherTs.commonData["gameID"] = "clutcher";
    util.giveItems("clutcher");
    util.confirmMessage("§7Teleporting to bridger...");
    util.teleportation(data.locationData.clutcher[0 as keyof typeof data.locationData.clutcher]);
  }

  // wall run
  if (selection === 5) {
    wallRunTs.commonData["gameID"] = "wallRun";
    util.giveItems("wallRun");
    util.confirmMessage("§7Teleporting to bridger...");
    util.teleportation(<TeleportationLocation>data.locationData.wallRun);
  }

  // back to lobby
  if (selection === 7) util.teleportation(<TeleportationLocation>data.locationData.lobby);
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
