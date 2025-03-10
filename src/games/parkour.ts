import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import { parkourForm } from "../forms/parkour";
import { parkourTs } from "../data/tempStorage";
import minecraftID from "../models/minecraftID";
import { SubCategory } from "../models/GameID";

const baseBlocks: Set<minecraftID.MinecraftBlockIdIF> = new Set([
  "minecraft:air",
  "minecraft:polished_blackstone_pressure_plate",
  "minecraft:light_weighted_pressure_plate",
]);

const allowedBlocks: Record<SubCategory<"Parkour">, Set<minecraftID.MinecraftBlockIdIF>> = {
  "Chapter_1.1": new Set([...baseBlocks, "minecraft:verdant_froglight", "minecraft:slime"]),
  "Chapter_1.2": new Set([...baseBlocks, "minecraft:ochre_froglight"]),
  "Chapter_1.3": new Set([...baseBlocks, "minecraft:pearlescent_froglight", "minecraft:slime"]),
  "Chapter_2.1": new Set([...baseBlocks, "minecraft:hay_block"]),
  "Chapter_2.2": new Set([...baseBlocks, "minecraft:mud_bricks"]),
};

/**
 * disables the plate if not disabled; returns true or false depending on availiability
 */
const isPlateDisabled = function (plate: "start" | "end"): boolean {
  if (parkourTs.tempData["isPlateDisabled"][plate]) return true;
  parkourTs.tempData["isPlateDisabled"][plate] = true;
  return false;
};

/**
 * re-enable pressure plate (disabled temp when plate is pressed)
 */
const enablePlate = function (): void {
  parkourTs.tempData["isPlateDisabled"].start = false;
  parkourTs.tempData["isPlateDisabled"].end = false;
  parkourTs.tempData["autoReq"] = undefined;
};
//////////////////////////////////////////////////
export const parkourFormHandler = async function (player: mc.Player) {
  const { selection } = await parkourForm(player);

  // reset pb
  if (selection === 11) {
    util.resetPB(player, "Parkour");
  }

  // back to lobby
  if (selection === 15) {
    util.backToLobbyKit(player, parkourTs);
  }
};

export const pressurePlatePushEvt = function ({ block }: { block: mc.Block }) {
  const player = parkourTs.commonData["player"];

  switch (block.typeId) {
    // start
    case "minecraft:polished_blackstone_pressure_plate":
      if (isPlateDisabled("start")) return;
      player.playSound("note.pling");
      parkourTs.startTimer();
      break;

    // end
    case "minecraft:light_weighted_pressure_plate":
      if (isPlateDisabled("end") || !parkourTs.tempData["isPlateDisabled"]["start"]) return;
      util.onRunnerSuccess("Parkour", parkourTs, enablePlate);
      break;
  }
};

export const listener = function () {
  util.displayScoreboard("Parkour");

  const playerLocation = parkourTs.commonData["player"].location;
  const blockUnder = mc.world
    .getDimension("overworld")
    .getBlock({ x: playerLocation.x, y: playerLocation.y - 1, z: playerLocation.z });
  const parkourID = <SubCategory<"Parkour">>util.getCurrentSubCategory();

  if (
    !allowedBlocks[parkourID].has(<minecraftID.MinecraftBlockIdIF>blockUnder.typeId) &&
    !parkourTs.tempData["autoReq"] &&
    blockUnder.isSolid
  ) {
    util.onRunnerFail("Parkour", enablePlate);
  }
};
