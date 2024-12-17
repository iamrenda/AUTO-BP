import { lobbyForm } from "../script/forms.js";
import * as exp from "../script/functions.js";
import * as data from "../script/data.js";

export const nagivatorFormHandler = function (player) {
  lobbyForm(player).then(({ selection }) => {
    // bridger
    if (selection === 1) {
      exp.giveItems(player, [
        { item: data.tempData.block, quantity: 64 },
        { item: data.tempData.block, quantity: 64 },
        { item: "minecraft:wooden_pickaxe", quantity: 1 },
        { item: "minecraft:book", quantity: 1, slot: 8 },
      ]);

      exp.setGameId("bridger");
      exp.teleportation(player, data.locationData.bridger.straight);
      exp.confirmMessage(player, "§7Teleporting to bridger...");
    }

    // clutcher
    if (selection === 3) {
      console.warn("2");
      exp.setGameId("clutcher");
    }

    // back to lobby
    if (selection === 7) exp.teleportation(player, data.locationData.lobby);
  });
};
