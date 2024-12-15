import * as mc from "@minecraft/server";
import { lobbyForm } from "../script/forms.js";
import * as exp from "../script/functions.js";
import * as data from "../script/data.js";

export const nagivatorFormHandler = function (player) {
  lobbyForm(player).then((res) => {
    switch (res.selection) {
      case 1: // bridger
        exp.giveItems(player, [
          { item: data.tempData.block, quantity: 64 },
          { item: data.tempData.block, quantity: 64 },
          { item: "minecraft:wooden_pickaxe", quantity: 1 },
          { item: "minecraft:book", quantity: 1, slot: 8 },
        ]);

        exp.setGameId("bridger");
        exp.teleportation(player, data.locationData.bridger.straight);

        break;
      case 3: // clutcher
        console.warn("2");
        exp.setGameId("clutcher");
        break;

      case 7: // back to lobby
        exp.teleportation(player, data.locationData.lobby);
        break;
    }
  });
};
