import { Player } from "@minecraft/server";
import { ActionFormResponse } from "@minecraft/server-ui";
import { fistReduceTs } from "../data/tempStorage";
import ChestFormData from "../formExtensions/forms";

export const fistReduceForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27")
    .title("Settings")
    .button(
      10,
      fistReduceTs.tempData["reduceBotStatus"] === "Starting"
        ? "§2Start"
        : fistReduceTs.tempData["reduceBotStatus"] === "Running"
        ? "§cPause"
        : "§6Continue",
      [],
      fistReduceTs.tempData["reduceBotStatus"] === "Starting"
        ? "minecraft:emerald_block"
        : fistReduceTs.tempData["reduceBotStatus"] === "Running"
        ? "minecraft:redstone_block"
        : "minecraft:gold_block",
      1,
      false
    )
    .button(
      13,
      fistReduceTs.tempData["reduceBotHits"] === "Single"
        ? "§aSingle Hit"
        : fistReduceTs.tempData["reduceBotHits"] === "Double"
        ? "§6Double Hit"
        : "§cTriple Hit",
      [],
      fistReduceTs.tempData["reduceBotHits"] === "Single"
        ? "minecraft:apple"
        : fistReduceTs.tempData["reduceBotHits"] === "Double"
        ? "minecraft:golden_apple"
        : "minecraft:enchanted_golden_apple",
      1,
      false
    )
    .button(16, "§cQuit", [], "minecraft:red_dye", 1, false);

  return await form.show(player);
};
