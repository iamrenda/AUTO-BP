import { ActionFormResponse } from "@minecraft/server-ui";
import { Player } from "@minecraft/server";
import ChestFormData from "../formExtensions/forms";
import { wallRunTs } from "../data/tempStorage";

export const wallRunForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27")
    .title("Settings")
    .button(10, "§2General", [], "minecraft:grass_block", 1, false)
    .button(13, "§c§lReset Personal Best", [], "minecraft:tnt", 1, false)
    .button(16, "§cQuit", [], "minecraft:red_dye", 1, false);

  return await form.show(player);
};

export const wallRunGeneralForm = async function (player: Player): Promise<ActionFormResponse> {
  const isCheckPointEnabled = wallRunTs.tempData["wallRunIsCheckPointEnabled"];
  const form = new ChestFormData("27")
    .title("General Settings")
    .button(
      11,
      "§6Save CheckPoint",
      ["", `${isCheckPointEnabled ? "§aEnabled" : "§cDisabled"}`],
      isCheckPointEnabled ? "minecraft:redstone_torch" : "minecraft:unlit_redstone_torch",
      1,
      false
    );

  return await form.show(player);
};
