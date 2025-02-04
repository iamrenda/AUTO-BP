import { Player } from "@minecraft/server";
import { ActionFormResponse } from "@minecraft/server-ui";
import ChestFormData from "../formExtensions/forms";
import { clutcherTs } from "../data/tempStorage";

export const clutcherForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27")
    .title("Clutcher Selector")
    .button(10, "§aStart", [], "minecraft:green_dye", 1, false)
    .button(12, "§dClutch Settings", [], "minecraft:repeater", 1, false)
    .button(14, "§2General Settings", [], "minecraft:grass_block", 1, false)
    .button(16, "§cQuit", [], "minecraft:red_dye", 1, false);

  return form.show(player);
};

export const clutchGeneralForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27")
    .title("Clutcher General Settings")
    .button(
      10,
      '§6"Shift + Right Click" to start',
      ["", clutcherTs.tempData["clutchShiftStart"] ? "§aEnabled" : "§cDisabled"],
      clutcherTs.tempData["clutchShiftStart"] ? "minecraft:redstone_torch" : "minecraft:unlit_redstone_torch",
      1,
      false
    );

  return form.show(player);
};

export const clutchNumForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27").title("Clutcher Hit Settings");
  for (let i = 0; i <= 8; i++) form.button(i + 9, `${i + 1} Hits`, [], "minecraft:blaze_rod", i + 1, false);

  return form.show(player);
};

export const clutchSettingsForm = function (): ChestFormData {
  return new ChestFormData("27").title("Clutch Settings");
};
