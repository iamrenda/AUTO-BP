import { Player } from "@minecraft/server";
import { ActionFormResponse } from "@minecraft/server-ui";
import ChestFormData from "../formExtensions/forms";

export const parkourForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27")
    .title("Settings")
    .button(11, "§l§cReset PB", [], "minecraft:tnt", 1, false)
    .button(15, "§cQuit", [], "minecraft:red_dye", 1, false);

  return await form.show(player);
};
