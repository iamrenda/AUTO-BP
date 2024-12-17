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
      itemName: "§2Blocks", // CHECK
      itemDesc: [],
      texture: tempData.block,
      stackSize: 1,
      enchanted: false,
    },
    i: {
      itemName: "§3Island",
      itemDesc: [],
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

// CHECK
const bridgerGeneralForm = async function (player) {};

const bridgerIslandForm = async function (player) {
  const form = new ChestFormData("45")
    .title("Island Customization")
    .pattern((["_________"], ["_s_c_____"], ["_m_f_____"], ["_l_______"], ["_________"]), {
      s: {
        itemName: "§616 Blocks", //CHECK
        itemDesc: [],
        texture: "minecraft:sandstone",
        stackSize: 16,
        enchanted: false,
      },
      m: {
        itemName: "§625 Blocks",
        itemDesc: [],
        texture: "minecraft:sandstone",
        stackSize: 21,
        enchanted: false,
      },
      l: {
        itemName: "§650 Blocks",
        itemDesc: [],
        texture: "minecraft:sandstone",
        stackSize: 50,
        enchanted: false,
      },
      c: {
        itemName: "§6StairCased",
        itemDesc: [],
        texture: "minecraft:sandstone_stairs",
        stackSize: 1,
        enchanted: dynamicProperty.getBoolean("straightHeight"),
      },
      f: {
        itemName: "§6Flat",
        itemDesc: [],
        texture: "minecraft:sandstone_slab",
        stackSize: 1,
        enchanted: !dynamicProperty.getBoolean("straightHeight"),
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

export { lobbyForm, confirmationForm, bridgerIslandForm, bridgerForm, bridgerBlockForm };
