import { Player } from "@minecraft/server";
import { ActionFormData, ActionFormResponse } from "@minecraft/server-ui";
import { VERSION } from "../data/staticData";
import * as util from "../utilities/utilities";
import ChestFormData from "../formExtensions/forms";
import GameID from "../models/GameID";
import { getGameInfo } from "../utilities/mapping";

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

export const statsForm = async function (player: Player, gameID: GameID): Promise<ActionFormResponse> {
  const { name: gamemodeName, bundlableID, baseData } = getGameInfo(gameID);
  const { pbTicks, avgTicks, attempts, successAttempts } = baseData.getBundledData(bundlableID);

  const form = new ActionFormData()
    .title("Stats")
    .body(
      `§3§lAUTO World§r §8- Version ${VERSION}§r

 §bIgn: §f${player.nameTag}
 §bGamemode: §f${gamemodeName}

   §7- §6Personal Best: §f${util.tickToSec(pbTicks)}
   §7- §6Average Time: §f${util.tickToSec(avgTicks)}
   §7- §6Attempts: §f${attempts}
   §7- §6Successful Attempts: §f${successAttempts}


    `
    )
    .button("Close");

  return await form.show(player);
};
