import { Player } from "@minecraft/server";
import { ActionFormResponse } from "@minecraft/server-ui";
import ChestFormData from "../formExtensions/forms";

export const bedwarsRushForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27")
    .title("Settings")
    .pattern(["_________", "_______o_", "_________"], {
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
