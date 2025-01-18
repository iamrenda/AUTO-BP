import { Player } from "@minecraft/server";
import { ActionFormResponse } from "@minecraft/server-ui";
import ChestFormData from "../formExtensions/forms";
import ts from "../data/tempStorage";

const clutcherForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27").title("Clutcher Selector").pattern(["_________", "_r_s_b_q_", "_________"], {
    r: {
      itemName: "§aStart",
      itemDesc: [],
      texture: "minecraft:green_dye",
      stackAmount: 1,
      enchanted: false,
    },
    s: {
      itemName: "§dClutch Settings",
      itemDesc: [],
      texture: "minecraft:repeater",
      stackAmount: 1,
      enchanted: false,
    },
    b: {
      itemName: "§2General Settings",
      itemDesc: [],
      texture: "minecraft:grass_block",
      stackAmount: 1,
      enchanted: false,
    },
    q: {
      itemName: "§cQuit",
      itemDesc: [],
      texture: "minecraft:red_dye",
      stackAmount: 1,
      enchanted: false,
    },
  });

  return form.show(player);
};

const clutchGeneralForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27")
    .title("Clutcher General Settings")
    .pattern(["_________", "_s_______", "_________"], {
      s: {
        itemName: '§6"Shift + Right Click" to start',
        itemDesc: ["", ts.getData("clutchShiftStart") ? "§aEnabled" : "§cDisabled"],
        texture: ts.getData("clutchShiftStart") ? "minecraft:redstone_torch" : "minecraft:unlit_redstone_torch",
        stackAmount: 1,
        enchanted: false,
      },
    });
  return form.show(player);
};

const clutchNumForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27").title("Clutcher Hit Settings");
  for (let i = 0; i <= 8; i++) form.button(i + 9, `${i + 1} Hits`, [], "minecraft:blaze_rod", i + 1, false);
  return form.show(player);
};

const clutchSettingsForm = function (): ChestFormData {
  return new ChestFormData("27").title("Clutch Settings");
};

export { clutcherForm, clutchGeneralForm, clutchNumForm, clutchSettingsForm };
