import * as form from "../forms/lobby";
import { bridgerHandler } from "./bridger";
import { defineClutcher } from "./clutcher";
import * as exp from "../utilities/utilities";
import * as data from "../utilities/staticData";
import tempData from "utilities/tempData";
export const nagivatorFormHandler = async function (player) {
    const { selection } = await form.lobbyForm(player);
    if (selection === 1) {
        const { selection: bridgerDirSelection } = await form.formBridgerDirForm(player);
        if (bridgerDirSelection === 2)
            bridgerHandler(player, "straightBridger");
        else if (bridgerDirSelection === 6)
            bridgerHandler(player, "inclinedBridger");
    }
    if (selection === 3) {
        defineClutcher(player);
        exp.giveItems(player, data.getInvData("clutcher"));
        tempData.gameID = "clutcher";
        exp.confirmMessage(player, "§7Teleporting to bridger...");
        exp.teleportation(player, data.locationData.clutcher[0]);
    }
    if (selection === 7)
        exp.teleportation(player, data.locationData.lobby);
};
export const launchingHandler = function (player) {
    const { x: directionX, y: directionY, z: directionZ } = player.getViewDirection();
    player.applyKnockback(directionX, directionZ, 7, 2 * (1 + directionY));
    player.playSound("breeze_wind_charge.burst", { location: player.location });
    player.spawnParticle("minecraft:huge_explosion_emitter", player.location);
};
export const creditFormHandler = function (player) {
    form.lobbyCreditForm(player);
};
