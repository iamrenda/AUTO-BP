import ChestFormData from "../formExtensions/forms";
import { bridgerTs } from "../data/tempStorage";
import { Player } from "@minecraft/server";
import { ActionFormResponse } from "@minecraft/server-ui";
import { bridgerBlocks } from "../data/staticData";
import { gameData } from "../data/dynamicProperty";

export const bridgerForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27")
    .title("Settings")
    .button(10, "§3General", [], "minecraft:grass_block", 1, false)
    .button(12, "§2Blocks", [], bridgerTs.tempData["blockBridger"], 1, false)
    .button(14, "§l§4Reset Personal Best", [], "minecraft:tnt", 1, false)
    .button(16, "§cQuit", [], "minecraft:red_dye", 1, false);

  return await form.show(player);
};

export const bridgerBlockForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27").title("Block Selection");

  bridgerBlocks.map(({ blockName, texture }, index) =>
    texture === bridgerTs.tempData["blockBridger"]
      ? form.button(index + 9, blockName, ["", "§eSelected"], texture, 1, true)
      : form.button(index + 9, blockName, [], texture, 1, false)
  );
  return await form.show(player);
};

export const bridgerGeneralForm = async function (player: Player): Promise<ActionFormResponse> {
  const { bridgerDirection, breakingAnimation } = bridgerTs.tempData;
  const distance = gameData.getData(`Bridger${bridgerDirection}Distance`);
  const tellyPractice = gameData.getData("BridgerStraightTellyMode");

  const form = new ChestFormData("54")
    .title("Island Customization")
    .button(10, "§616 Blocks", [], "minecraft:sandstone", 16, distance === 16)
    .button(19, "§621 Blocks", [], "minecraft:sandstone", 21, distance === 21)
    .button(28, "§650 Blocks", [], "minecraft:sandstone", 50, distance === 50)
    .button(12, "§6Telly Practice", [], "minecraft:ender_eye", 1, tellyPractice === "Telly")
    .button(21, "§6Speed Telly Practice", [], "minecraft:ender_pearl", 1, tellyPractice === "Speed_Telly")
    .button(30, "§6No Telly Practice", [], "minecraft:slime_ball", 1, tellyPractice === "None")
    .button(14, "§6Domino Falling Animation", [], "minecraft:ice", 1, breakingAnimation === "Falling Domino")
    .button(23, "§6Falling Animation", [], "minecraft:sand", 1, breakingAnimation === "Falling")
    .button(32, "§6Domino Animation", [], "minecraft:piston", 1, breakingAnimation === "Domino")
    .button(41, "§6None", [], "minecraft:gray_concrete", 1, breakingAnimation === "None");

  return await form.show(player);
};
