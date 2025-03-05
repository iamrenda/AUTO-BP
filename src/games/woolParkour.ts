import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import { woolParkourTs } from "../data/tempStorage";
import { woolParkourForm } from "../forms/woolParkour";

/**
 * disables the plate if not disabled; returns true or false depending on availiability
 */
const isPlateDisabled = function (): boolean {
  if (woolParkourTs.tempData["isPlateDisabled"]) return true;
  woolParkourTs.tempData["isPlateDisabled"] = true;
  return false;
};

const enablePlate = function (): void {
  woolParkourTs.tempData["isPlateDisabled"] = false;
};

export const parkourFormHandler = async function (player: mc.Player) {
  const { selection } = await woolParkourForm(player);

  // reset pb
  if (selection === 11) {
    util.resetPB(player, "Wool_Parkour");
  }

  // back to lobby
  if (selection === 15) {
    util.backToLobbyKit(player, woolParkourTs);
  }
};

export const pressurePlatePushEvt = function (block: mc.Block) {
  if (block.typeId !== "minecraft:light_weighted_pressure_plate") return;
  if (isPlateDisabled()) return;

  util.onRunnerSuccess("Wool_Parkour", woolParkourTs, enablePlate);
};

export const placingBlockEvt = function ({ location }: { location: mc.Vector3 }) {
  woolParkourTs.commonData["storedLocations"].add(location);
};

export const listener = function () {
  const parentGameID = util.getCurrentParentCategory();
  util.displayScoreboard(parentGameID);

  if (!(woolParkourTs.commonData["player"].location.y < 95)) return;

  // on fail
  util.onRunnerFail("Wool_Parkour");
};
