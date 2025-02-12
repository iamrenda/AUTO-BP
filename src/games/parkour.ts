import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import { parkourForm } from "../forms/parkour";
import { parkourTs } from "../data/tempStorage";
import { ParkourData } from "../data/dynamicProperty";
import { ParkourChapterID } from "../models/DynamicProperty";
import minecraftID from "../models/minecraftID";

type ExcludedBlocks = Record<ParkourChapterID, Set<minecraftID.MinecraftBlockIdIF>>;

const dimension = mc.world.getDimension("overworld");

const excludedBlocks: ExcludedBlocks = {
  [ParkourChapterID.chapter1_1]: new Set([
    "minecraft:air",
    "minecraft:polished_blackstone_pressure_plate",
    "minecraft:light_weighted_pressure_plate",
    "minecraft:verdant_froglight",
    "minecraft:slime",
  ]),
  [ParkourChapterID.chapter1_2]: new Set([
    "minecraft:air",
    "minecraft:polished_blackstone_pressure_plate",
    "minecraft:light_weighted_pressure_plate",
    "minecraft:ochre_froglight",
  ]),
  [ParkourChapterID.chapter1_3]: new Set([
    "minecraft:air",
    "minecraft:polished_blackstone_pressure_plate",
    "minecraft:light_weighted_pressure_plate",
    "minecraft:pearlescent_froglight",
    "minecraft:slime",
  ]),
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
    const parkourChapter = parkourTs.tempData["chapter"].substring(7).split("_").join(".");
    util.resetPB(player, ParkourData, `Parkour ${parkourChapter}`, "Parkour");
  }

  // back to lobby
  if (selection === 15) {
    util.backToLobbyKit(player, parkourTs);
  }
};

export const pressurePlatePushEvt = function (block: mc.Block) {
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
      util.onRunnerSuccess(parkourTs, ParkourData, enablePlate);
      break;
  }
};

export const listener = function () {
  util.displayScoreboard(parkourTs.commonData["gameID"]);

  const playerLocation = parkourTs.commonData["player"].location;
  const blockUnder = dimension.getBlock({ x: playerLocation.x, y: playerLocation.y - 1, z: playerLocation.z });
  const parkourID = parkourTs.tempData["chapter"];

  if (
    !excludedBlocks[parkourID].has(<minecraftID.MinecraftBlockIdIF>blockUnder.typeId) &&
    !parkourTs.tempData["autoReq"] &&
    blockUnder.isSolid
  ) {
    util.onRunnerFail(ParkourData);
    enablePlate();
  }
};
