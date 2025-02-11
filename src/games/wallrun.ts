import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import * as form from "../forms/wallrun";
import { wallRunTs } from "../data/tempStorage";
import { DynamicPropertyID } from "../models/DynamicProperty";
import { locationData } from "../data/staticData";
import { WallRunData } from "../data/dynamicProperty";
import { confirmationForm } from "../forms/utility";

/**
 * disables the plate if not disabled; returns true or false depending on availiability
 */
const isPlateDisabled = function (plate: "first" | "checkpoint" | "goal"): boolean {
  if (wallRunTs.tempData["isPlateDisabled"][plate]) return true;
  wallRunTs.tempData["isPlateDisabled"][plate] = true;
  return false;
};

/**
 * re-enable pressure plate (disabled temp when plate is pressed)
 */
const enablePlate = function (): void {
  wallRunTs.tempData["isCheckPointSaved"] = false;
  Object.keys(wallRunTs.tempData["isPlateDisabled"]).map(
    (plate) =>
      (wallRunTs.tempData["isPlateDisabled"][plate as keyof (typeof wallRunTs.tempData)["isPlateDisabled"]] = false)
  );
};
/////////////////////////////////////////////////////////////////////////
export const pressurePlatePushEvt = function ({ location }: { location: mc.Vector3 }) {
  switch (location.z) {
    // start
    case 30016:
      if (isPlateDisabled("first")) return;
      WallRunData.addData(DynamicPropertyID.WallRunner_Attempts);
      wallRunTs.startTimer();
      break;

    // checkpoint
    case 30075:
      if (isPlateDisabled("checkpoint")) return;
      if (!wallRunTs.tempData["wallRunIsCheckPointEnabled"]) return;
      util.confirmMessage("§aCheckPoint Saved!", "random.orb");
      wallRunTs.tempData["isCheckPointSaved"] = true;
      break;

    // goal
    case 30121:
      if (isPlateDisabled("goal")) return;
      const player = wallRunTs.commonData["player"];

      player.setGameMode(mc.GameMode.spectator);
      util.resetMap(wallRunTs, WallRunData, enablePlate);
      break;
  }
};

export const wallRunFormHandler = async function (player: mc.Player) {
  const { selection } = await form.wallRunForm(player);

  // general
  if (selection === 10) {
    const { selection: generalSelection } = await form.wallRunGeneralForm(player);

    // saved checkpoint
    if (generalSelection === 10) {
      const isCheckPointEnabled = wallRunTs.tempData["wallRunIsCheckPointEnabled"];
      wallRunTs.tempData["wallRunIsCheckPointEnabled"] = !isCheckPointEnabled;
      util.confirmMessage(`§aCheckpoint is now ${!isCheckPointEnabled ? "§aEnabled!" : "§cDisabled!"}`, "random.orb");
    }
  }

  // reset pb
  if (selection === 13) {
    const { selection: confirmationSelection } = await confirmationForm(player, `Wall Run`);
    if (confirmationSelection !== 15) return;

    WallRunData.setData(DynamicPropertyID.WallRunner_PB, -1);
    util.confirmMessage("§aSuccess! Your personal best score has been reset!", "random.orb");
    util.updateFloatingText(WallRunData.getBundledData("WallRunner"));
  }

  // back to lobby
  if (selection === 16) {
    wallRunTs.clearBlocks();
    util.backToLobbyKit(player, wallRunTs);
  }
};

export const placingBlockEvt = function ({ location }: { location: mc.Vector3 }) {
  wallRunTs.commonData["storedLocations"].add(location);
};

export const listener = function () {
  const player = wallRunTs.commonData["player"];

  util.displayScoreboard("wallRun");

  if (!(player.location.y < 98) || player.getGameMode() === mc.GameMode.spectator) return;

  if (wallRunTs.tempData["isCheckPointSaved"]) {
    // going back to checkpoint
    util.confirmMessage("§7Teleporting back to the checkpoint...");
    util.teleportation({
      position: { x: 30009.5, y: 106, z: 30077.5 },
      facing: { x: 30009.5, y: 106, z: 30078 },
    });
    util.giveItems("wallRun");
    wallRunTs.clearBlocks();
  } else {
    // going back to spawn
    wallRunTs.stopTimer();
    wallRunTs.clearBlocks();
    WallRunData.addData(DynamicPropertyID.WallRunner_Attempts);
    util.updateFloatingText(WallRunData.getBundledData("WallRunner"));
    util.giveItems("wallRun");
    util.teleportation(locationData.wallRun);
    enablePlate();
  }
};
