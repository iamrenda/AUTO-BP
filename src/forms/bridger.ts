import ChestFormData from "../formExtensions/forms";
import { bridgerTs } from "../data/tempStorage";
import { Player } from "@minecraft/server";
import { ActionFormResponse } from "@minecraft/server-ui";
import { formBlocks } from "../data/staticData";
import { GameData } from "../data/dynamicProperty";

export const bridgerForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27")
    .title("Settings")
    .pattern(["_________", "_i_b_r_o_", "_________"], {
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

export const bridgerBlockForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27").title("Block Selection");

  formBlocks.map(({ blockName, texture }, index) =>
    texture === bridgerTs.tempData["blockBridger"]
      ? form.button(index + 9, blockName, ["", "§eSelected"], texture, 1, true)
      : form.button(index + 9, blockName, [], texture, 1, false)
  );
  return await form.show(player);
};

export const bridgerIslandForm = async function (player: Player): Promise<ActionFormResponse> {
  const distance = GameData.getData("Distance");
  const tellyPractice = GameData.getData("TellyPractice");
  const direction = bridgerTs.tempData["bridgerDirection"];

  const form =
    direction === "straight"
      ? new ChestFormData("45")
          .title("Island Customization")
          .pattern(["_________", "_s_t_____", "_m_T_____", "_l_n_____", "_________"], {
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
            t: {
              itemName: "§6Telly Practice",
              itemDesc: [],
              texture: "minecraft:ender_eye",
              stackAmount: 1,
              enchanted: tellyPractice === "Telly",
            },
            T: {
              itemName: "§6Speed Telly Practice",
              itemDesc: [],
              texture: "minecraft:ender_pearl",
              stackAmount: 1,
              enchanted: tellyPractice === "Speed Telly",
            },
            n: {
              itemName: "§6No Telly Practice",
              itemDesc: [],
              texture: "minecraft:slime_ball",
              stackAmount: 1,
              enchanted: tellyPractice === "None",
            },
          })
      : new ChestFormData("45")
          .title("Island Customization")
          .pattern(["_________", "_s_______", "_m_______", "_l_______", "_________"], {
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
          });
  return await form.show(player);
};
