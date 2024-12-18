import { ChestFormData } from "../extensions/forms.js";
import { tempData, blocks, pickaxes } from "./data.js";
import dynamicProperty from "./dynamicProperty.js";

const lobbyForm = async function (player) {
  const form = new ChestFormData("9").title("Lobby Selector").pattern(["_a_b___s_"], {
    a: {
      itemName: "§6§lBridger",
      itemDesc: ["§7Practice bridging across the", "§7other island as fast as you can!", "", "§eClick to Play!"],
      texture: "minecraft:ladder",
      stackAmount: 1,
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
      stackAmount: 1,
      enchanted: false,
    },
    s: {
      itemName: "§7Back to Lobby",
      itemDesc: [],
      texture: "minecraft:mob_spawner",
      stackAmount: 1,
      enchanted: false,
    },
  });

  return await form.show(player);
};

const confirmationForm = async function (player) {
  const form = new ChestFormData("27").title("§4§lAre you sure?").pattern(["_________", "__n___y__", "_________"], {
    n: {
      itemName: "§7Cancel",
      itemDesc: [],
      texture: "minecraft:gray_wool",
      stackAmount: 1,
      enchanted: false,
    },
    y: {
      itemName: "§l§4Confirm",
      itemDesc: [],
      texture: "minecraft:red_wool",
      stackAmount: 1,
      enchanted: false,
    },
  });
  return await form.show(player);
};

const pickaxeForm = async function (player) {
  const form = new ChestFormData("27").title("Pickaxe Selection");

  pickaxes.map(({ pickaxeName, texture }, index) =>
    texture === tempData.pickaxe
      ? form.button(index, pickaxeName, ["", "§eSelected"], texture, 1, true)
      : form.button(index, pickaxeName, [], texture, 1, false)
  );
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

const bridgerForm = async function (player) {
  const form = new ChestFormData("27").title("Settings").pattern(["_________", "_b_i_r_o_", "_________"], {
    b: {
      itemName: "§3General",
      itemDesc: [],
      texture: "minecraft:comparator",
      stackAmount: 1,
      enchanted: false,
    },
    i: {
      itemName: "§2Island",
      itemDesc: [],
      texture: "minecraft:grass_block",
      stackAmount: 1,
      enchanted: false,
    },
    r: {
      itemName: "§l§4Reset Personal Best",
      itemDesc: [],
      texture: "minecraft:tnt",
      stackAmount: 1,
      enchanted: false,
    },
    o: {
      itemName: "§cQuit",
      itemDesc: [],
      texture: "minecraft:red_dye",
      stackAmount: 1,
      enchanted: false,
    },
  });
  return await form.show(player);
};

const bridgerGeneralForm = async function (player) {
  const form = new ChestFormData("27")
    .title("Bridger General Settings")
    .pattern(["_________", "_b_p_____", "_________"], {
      b: {
        itemName: "§2Blocks",
        itemDesc: [],
        texture: "minecraft:sandstone",
        stackAmount: 1,
        enchanted: false,
      },
      p: {
        itemName: "§2Pickaxe",
        itemDesc: [],
        texture: tempData.pickaxe,
        stackAmount: 1,
        enchanted: false,
      },
    });
  return await form.show(player);
};

const bridgerIslandForm = async function (player) {
  const form = new ChestFormData("45")
    .title("Island Customization")
    .pattern(["_________", "_s_c_____", "_m_f_____", "_l_______", "_________"], {
      s: {
        itemName: "§616 Blocks",
        itemDesc: [],
        texture: "minecraft:sandstone",
        stackAmount: 16,
        enchanted: +dynamicProperty.getGameData("straightDistance") === 16,
      },
      m: {
        itemName: "§621 Blocks",
        itemDesc: [],
        texture: "minecraft:sandstone",
        stackAmount: 21,
        enchanted: +dynamicProperty.getGameData("straightDistance") === 21,
      },
      l: {
        itemName: "§650 Blocks",
        itemDesc: [],
        texture: "minecraft:sandstone",
        stackAmount: 50,
        enchanted: +dynamicProperty.getGameData("straightDistance") === 50,
      },
      c: {
        itemName: "§6StairCased",
        itemDesc: [],
        texture: "minecraft:sandstone_stairs",
        stackAmount: 1,
        enchanted: dynamicProperty.getGameData("straightIsStairCased"),
      },
      f: {
        itemName: "§6Flat",
        itemDesc: [],
        texture: "minecraft:sandstone_slab",
        stackAmount: 1,
        enchanted: !dynamicProperty.getGameData("straightIsStairCased"),
      },
    });
  return await form.show(player);
};

export {
  lobbyForm,
  confirmationForm,
  bridgerGeneralForm,
  bridgerIslandForm,
  bridgerForm,
  bridgerBlockForm,
  pickaxeForm,
};
