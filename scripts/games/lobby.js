import { lobbyForm } from "../script/forms.js";
import * as exp from "../script/functions.js";
import * as data from "../script/data.js";
import dynamicProperty from "../script/dynamicProperty.js";

export const nagivatorFormHandler = async function (player) {
  const { selection } = await lobbyForm(player);

  // bridger
  if (selection === 1) {
    exp.giveItems(player, [
      { item: data.tempData.block, quantity: 64 },
      { item: data.tempData.block, quantity: 64 },
      { item: "minecraft:book", quantity: 1, slot: 8 },
    ]);

    dynamicProperty.setGameId(`straight${dynamicProperty.getGameData("straightDistance")}b`);
    exp.teleportation(player, data.locationData.bridger.straight);
    exp.confirmMessage(player, "§7Teleporting to bridger...");
  }

  // clutcher
  if (selection === 3) {
    console.warn("2");
    dynamicProperty.setGameId("clutcher");
  }

  // back to lobby
  if (selection === 7) exp.teleportation(player, data.locationData.lobby);
};

export const launchingHandler = function (player) {
  const { x: directionX, y: directionY, z: directionZ } = player.getViewDirection();
  player.applyKnockback(directionX, directionZ, 7, 2 * (1 + directionY));
  player.playSound("breeze_wind_charge.burst", player.location);
  player.spawnParticle("minecraft:huge_explosion_emitter", player.location);
};
