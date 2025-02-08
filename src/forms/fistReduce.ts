import { Player } from "@minecraft/server";
import { ActionFormResponse } from "@minecraft/server-ui";
import { fistReduceTs } from "../data/tempStorage";
import ChestFormData from "../formExtensions/forms";

export const fistReduceForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27")
    .title("Settings")
    .button(
      10,
      fistReduceTs.tempData["gameModeStatus"] === "Starting"
        ? "§2Start"
        : fistReduceTs.tempData["gameModeStatus"] === "Running"
        ? "§cPause"
        : "§6Continue",
      [],
      fistReduceTs.tempData["gameModeStatus"] === "Starting"
        ? "minecraft:emerald_block"
        : fistReduceTs.tempData["gameModeStatus"] === "Running"
        ? "minecraft:redstone_block"
        : "minecraft:gold_block",
      1,
      false
    )
    .button(
      13,
      fistReduceTs.tempData["numHits"] === "Single"
        ? "§aSingle Hit"
        : fistReduceTs.tempData["numHits"] === "Double"
        ? "§6Double Hit"
        : "§cTriple Hit",
      [],
      fistReduceTs.tempData["numHits"] === "Single"
        ? "minecraft:apple"
        : fistReduceTs.tempData["numHits"] === "Double"
        ? "minecraft:golden_apple"
        : "minecraft:enchanted_golden_apple",
      1,
      false
    )
    .button(16, "§cQuit", [], "minecraft:red_dye", 1, false);

  return await form.show(player);
};
