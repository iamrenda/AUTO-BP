import { ActionFormResponse } from "@minecraft/server-ui";
import { Player } from "@minecraft/server";
import ChestFormData from "../formExtensions/forms";
import { wallRunTs } from "../data/tempStorage";

export const wallRunForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27")
    .title("Settings")
    .pattern(["_________", "_a__c__o_", "_________"], {
      a: {
        itemName: "§2General",
        itemDesc: [],
        texture: "minecraft:grass_block",
        stackAmount: 1,
        enchanted: false,
      },
      c: {
        itemName: "§c§lReset Personal Best",
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

export const wallRunGeneralForm = async function (player: Player): Promise<ActionFormResponse> {
  const isCheckPointEnabled = wallRunTs.tempData["wallRunIsCheckPointEnabled"];
  const form = new ChestFormData("27")
    .title("General Settings")
    .pattern(["_________", "_a_______", "_________"], {
      a: {
        itemName: "§6Save CheckPoint",
        itemDesc: ["", `${isCheckPointEnabled ? "§aEnabled" : "§cDisabled"}`],
        texture: isCheckPointEnabled
          ? "minecraft:redstone_torch"
          : "minecraft:unlit_redstone_torch",
        stackAmount: 1,
        enchanted: false,
      },
    });
  return await form.show(player);
};
