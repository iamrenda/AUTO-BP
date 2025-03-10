import { Player } from "@minecraft/server";
import { ActionFormData, ActionFormResponse } from "@minecraft/server-ui";
import { VERSION } from "../data/staticData";
import * as util from "../utilities/utilities";
import ChestFormData from "../formExtensions/forms";
import GameID, { BundlableGameID, subCategoryGameID } from "../models/GameID";
import { BaseGameData } from "../data/dynamicProperty";
import { handleNavigation } from "../games/lobby";

export const confirmationForm = async function (player: Player, title: string): Promise<ActionFormResponse> {
  const form = new ChestFormData("27")
    .title(`§4§lReset PB for ${title}??`)
    .button(11, "§7Cancel", [], "minecraft:gray_wool", 1, false)
    .button(15, "§l§4Reset", [], "minecraft:red_wool", 1, false);

  // !15: rejection, 15: confirm
  return await form.show(player);
};

export const clearBlocksForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27")
    .title("Clear Blocks?")
    .button(13, "§aClear Blocks", [], "minecraft:lime_wool", 1, false);

  return await form.show(player);
};

export const statsForm = async function <T extends BundlableGameID>(
  player: Player,
  bundlableGameID: T
): Promise<ActionFormResponse> {
  const subCategory = util.getCurrentSubCategory();
  const { pbTicks, avgTicks, attempts, successAttempts } = BaseGameData.getBundledData(bundlableGameID, subCategory);
  const successPercentage = (successAttempts / attempts) * 100;

  const form = new ActionFormData()
    .title("Stats")
    .body(
      `§3§lAUTO World§r §8- Version ${VERSION}§r

 §bIgn: §f${player.nameTag}
 §bGamemode: §f${util.toProperName(bundlableGameID)}
 §bCategory: §f${util.toProperName(subCategory)}

  §7- §6Personal Best: §f${util.tickToSec(pbTicks)}
  §7- §6Average Time: §f${util.tickToSec(avgTicks)}

  §7- §6Attempts: §f${attempts}
  §7- §6Successful Attempts: §f${successAttempts}
  §7- §6Successful Run Percentage: §f${successPercentage.toFixed(1)}
  `
    )
    .button("Close");

  return await form.show(player);
};

const subCategoryGameIDs: {
  [K in keyof subCategoryGameID]: subCategoryGameID[K][];
} = {
  Bridger: [
    "Straight_16_blocks",
    "Straight_21_blocks",
    "Straight_50_blocks",
    "Inclined_16_blocks",
    "Inclined_21_blocks",
    "Inclined_50_blocks",
  ],
  Wall_Run: ["Ancient"],
  Bedwars_Rush: ["Custom_Map"],
  Parkour: ["Chapter_1.1", "Chapter_1.2", "Chapter_1.3", "Chapter_2.1", "Chapter_2.2"],
  Wool_Parkour: ["Oak_1", "Oak_2", "Oak_3", "Prismarine_1", "Prismarine_2", "Prismarine_3"],
};

export const mapSelectorForm = async function (player: Player, parentGameID: keyof subCategoryGameID): Promise<void> {
  const form = new ChestFormData("36").title("Map Selector");

  const subcategories = subCategoryGameIDs[parentGameID] ?? [];

  for (let i = 10; i < subcategories.length + 10; i++) {
    const subCategory = subcategories[i - 10];
    form.button(i, `§6${util.toProperName(subCategory)}`, [], "minecraft:empty_map", 1);
  }

  const { selection, canceled } = await form.show(player);

  if (canceled) return;
  handleNavigation(<GameID>`${parentGameID}$${subcategories[selection - 10]}`);
};
