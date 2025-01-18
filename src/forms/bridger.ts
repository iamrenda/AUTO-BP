import ChestFormData from "../formExtensions/forms";
import { bridgerTs } from "../data/tempStorage";
import { Player } from "@minecraft/server";
import { ActionFormResponse } from "@minecraft/server-ui";
import { formBlocks } from "../data/staticData";
import { GameData } from "../data/dynamicProperty";

const bridgerForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27").title("Settings").pattern(["_________", "_i_b_r_o_", "_________"], {
    i: {
      itemName: "§3General",
      itemDesc: [],
      texture: "minecraft:grass_block",
      stackAmount: 1,
      enchanted: false,
    },
    b: {
      itemName: "§2Blocks",
      itemDesc: [],
      texture: bridgerTs.tempData["blockBridger"],
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

const bridgerBlockForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27").title("Block Selection");

  formBlocks.map(({ blockName, texture }, index) =>
    texture === bridgerTs.tempData["blockBridger"]
      ? form.button(index + 9, blockName, ["", "§eSelected"], texture, 1, true)
      : form.button(index + 9, blockName, [], texture, 1, false)
  );
  return await form.show(player);
};

const bridgerIslandForm = async function (player: Player): Promise<ActionFormResponse> {
  const distance = GameData.getData("Distance");
  const isStairCased = GameData.getData("IsStairCased");

  const form = new ChestFormData("45")
    .title("Island Customization")
    .pattern(["_________", "_s_c_____", "_m_f_____", "_l_______", "_________"], {
      s: {
        itemName: "§616 Blocks",
        itemDesc: [],
        texture: "minecraft:sandstone",
        stackAmount: 16,
        enchanted: distance === 16,
      },
      m: {
        itemName: "§621 Blocks",
        itemDesc: [],
        texture: "minecraft:sandstone",
        stackAmount: 21,
        enchanted: distance === 21,
      },
      l: {
        itemName: "§650 Blocks",
        itemDesc: [],
        texture: "minecraft:sandstone",
        stackAmount: 50,
        enchanted: distance === 50,
      },
      c: {
        itemName: "§6StairCased",
        itemDesc: [],
        texture: "minecraft:sandstone_stairs",
        stackAmount: 1,
        enchanted: isStairCased,
      },
      f: {
        itemName: "§6Flat",
        itemDesc: [],
        texture: "minecraft:sandstone_slab",
        stackAmount: 1,
        enchanted: !isStairCased,
      },
    });
  return await form.show(player);
};

export { bridgerBlockForm, bridgerForm, bridgerIslandForm };
