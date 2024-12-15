import { ChestFormData } from "../extensions/forms.js";
import { resetMap, updateFloatingText } from "../games/bridger.js";
import {
  setGameId,
  getGameId,
  locationData,
  giveItems,
  resetPB,
  teleportation,
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
          teleportation(player, locationData.bridger.straight);

          break;
        case 3: // clutcher
          console.warn("2");
          setGameId("clutcher");
          break;

        case 7: // back to lobby
          teleportation(player, locationData.lobby);
          break;
      }
    });
};

export const confirmationForm = function (player) {
  new ChestFormData("9")
    .title("§4§lAre you sure?")
    .pattern(["__n___y__"], {
      n: {
        itemName: "§7Cancel",
        itemDesc: [],
        texture: "minecraft:gray_wool",
        stackSize: 1,
        enchanted: false,
      },
      y: {
        itemName: "§l§4Confirm",
        itemDesc: [],
        texture: "minecraft:red_wool",
        stackSize: 1,
        enchanted: false,
      },
    })
    .show(player)
    .then(async (res) => {
      if (res.selection !== 6) return;

      try {
        await resetPB("straight25b");
        player.sendMessage(
          "§aSuccess! Your personal best score has been reset!"
        );
      } catch (err) {
        player.sendMessage(`§4Error, please try again. (error: ${err})`);
      }
      updateFloatingText();
    });
};

export const bridgerForm = function (player) {
  new ChestFormData("9")
    .title("Settings")
    .pattern(["_r_____o_"], {
      r: {
        itemName: "§l§4Reset Personal Best",
        itemDesc: [],
        texture: "minecraft:tnt",
        stackSize: 1,
        enchanted: false,
      },
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
        case 1: // reset pb
          confirmationForm(player);
          break;

        case 7: // quit
          setGameId("lobby");
          resetMap(false);
          break;
      }
    });
};
