import { Player } from "@minecraft/server";
import { ActionFormResponse } from "@minecraft/server-ui";
import ChestFormData from "../formExtensions/forms";

export const confirmationForm = async function (
  player: Player,
  title: string
): Promise<ActionFormResponse> {
  const form = new ChestFormData("27")
    .title(`§4§lReset PB for ${title}??`)
    .pattern(["_________", "__n___y__", "_________"], {
      n: {
        itemName: "§7Cancel",
        itemDesc: [],
        texture: "minecraft:gray_wool",
        stackAmount: 1,
        enchanted: false,
      },
      y: {
        itemName: "§l§4Reset",
        itemDesc: [],
        texture: "minecraft:red_wool",
        stackAmount: 1,
        enchanted: false,
      },
    });

  // !15: rejection, 15: confirm
  return await form.show(player);
};

export const clearBlocksForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27")
    .title("Clear Blocks?")
    .button(13, "§aClear Blocks", [], "minecraft:lime_wool", 1, false);

  return await form.show(player);
};
