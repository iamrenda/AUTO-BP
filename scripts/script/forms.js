import { ChestFormData } from "../extensions/forms.js";
import { tempData, blocks } from "./data.js";
import dynamicProperty from "./dynamicProperty.js";

const lobbyForm = async function (player) {
  const form = new ChestFormData("9").title("Lobby Selector").pattern(["_a_b___s_"], {
    a: {
      itemName: "§6§lBridger",
      itemDesc: ["§7Practice bridging across the", "§7other island as fast as you can!", "", "§eClick to Play!"],
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
  });

  return await form.show(player);
};

const confirmationForm = async function (player) {
  const form = new ChestFormData("9").title("§4§lAre you sure?").pattern(["__n___y__"], {
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
  });
  return await form.show(player);
};

const bridgerForm = async function (player) {
  const form = new ChestFormData("9").title("Settings").pattern(["_b_i_r_o_"], {
    b: {
      itemName: "§2Blocks",
      itemDesc: [],
      texture: tempData.block,
      stackSize: 1,
      enchanted: false,
    },
    i: {
      itemName: "§3Island",
      itemDesc: [`Current: ${dynamicProperty.getBoolean("straightHeight") ? "StairCased" : "Flat"}`],
      texture: "minecraft:sandstone_stairs",
      stackSize: 1,
      enchanted: false,
    },
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
  });
  return await form.show(player);
};

const islandForm = async function (player) {
  const form = new ChestFormData("27")
    .title("Island Customization")
    .pattern(["_s_______"], ["_m_______"], ["_l_______"], {
      s: {
        itemName: "§c16 Blocks", //CHECK
        itemDesc: [],
        texture: "minecraft:sandstone_stairs",
        stackSize: 16,
        enchanted: false,
      },
      m: {
        itemName: "§c25 Blocks",
        itemDesc: [],
        texture: "minecraft:sandstone_stairs",
        stackSize: 21,
        enchanted: false,
      },
      l: {
        itemName: "§c50 Blocks",
        itemDesc: [],
        texture: "minecraft:sandstone_stairs",
        stackSize: 50,
        enchanted: false,
      },
    });
};

const bridgerBlockForm = async function (player) {
  const form = new ChestFormData("27").title("Block Selection");

  blocks.map(({ blockName, texture }, index) =>
    texture === tempData.block
      ? form.button(index, blockName, ["", "§eSelected"], texture, 1, true)
      : form.button(index, blockName, [], texture, 1, false)
  );
  return await form.show(player);
};

export { lobbyForm, confirmationForm, bridgerForm, bridgerBlockForm };
