import { ChestFormData } from "../extensions/forms.js";
import { resetMap } from "../games/bridger.js";
import {
  setGameId,
  getGameId,
  locationData,
  giveItems,
} from "../script/export.js";

export const lobbyMenu = function (player) {
  new ChestFormData("9")
    .title("Lobby Selector")
    .pattern(["_a_b___s_"], {
      a: {
        itemName: "§6§lBridger",
        itemDesc: [
          "§7Practice bridging across the",
          "§7other island as fast as you can!",
          "",
          "§eClick to Play!",
        ],
        texture: "minecraft:ladder",
        stackSize: 1,
        enchanted: false,
      },
      b: {
        itemName: "§6§lClutcher",
        itemDesc: [
          "§7Click fast as you can to make a",
          "§7clutch against multiple hits",
          "§7from an opponent!",
          "",
          "§eClick to Play!",
        ],
        texture: "minecraft:slime",
        stackSize: 1,
        enchanted: false,
      },
      s: {
        itemName: "§7Back to Lobby",
        itemDesc: [],
        texture: "minecraft:mob_spawner",
        stackSize: 1,
        enchanted: false,
      },
    })
    .show(player)
    .then((res) => {
      switch (res.selection) {
        case 1: // bridger
          giveItems(player, [
            { item: "minecraft:sandstone", quantity: 64 },
            { item: "minecraft:sandstone", quantity: 64 },
            { item: "minecraft:wooden_pickaxe", quantity: 1 },
            { item: "minecraft:book", quantity: 1, slot: 8 },
          ]);

          setGameId("bridger");
          player.teleport(locationData.bridger.straight.position, {
            facingLocation: locationData.bridger.straight.facing,
          });

          break;
        case 3: // clutcher
          console.warn("2");
          setGameId("clutcher");
          break;

        case 7: // back to lobby
          player.teleport(locationData.lobby.position, {
            facingLocation: locationData.lobby.facing,
          });
          break;
      }
    });
};

export const bridgerForm = function (player) {
  new ChestFormData("9")
    .title("Settings")
    .pattern(["_______o_"], {
      o: {
        itemName: "§cQuit",
        itemDesc: [],
        texture: "minecraft:red_dye",
        stackSize: 1,
        enchanted: false,
      },
    })
    .show(player)
    .then((res) => {
      switch (res.selection) {
        case 7:
          setGameId("lobby");
          resetMap(false);
          break;
      }
    });
};
