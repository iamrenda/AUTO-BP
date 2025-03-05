import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import * as form from "../forms/wallRun";
import { wallRunTs } from "../data/tempStorage";

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
  const player = wallRunTs.commonData["player"];

  switch (location.z) {
    // start
    case 30016:
      if (isPlateDisabled("first")) return;
      player.playSound("note.pling");
      wallRunTs.startTimer();
      break;

    // checkpoint
    case 30075:
      if (isPlateDisabled("checkpoint")) return;
      if (!wallRunTs.tempData["wallRunIsCheckPointEnabled"]) return;
      util.sendMessage("§aCheckPoint Saved!", "random.orb");
      wallRunTs.tempData["isCheckPointSaved"] = true;
      break;

    // goal
    case 30121:
      if (isPlateDisabled("goal")) return;

      player.setGameMode(mc.GameMode.spectator);
      util.onRunnerSuccess("Wall_Run", wallRunTs, enablePlate);
      break;
  }
};

export const wallRunFormHandler = async function (player: mc.Player) {
  const { selection } = await form.wallRunForm(player);

  // general
  if (selection === 10) {
    const { selection: generalSelection } = await form.wallRunGeneralForm(player);

    // saved checkpoint
    if (generalSelection === 11) {
      const isCheckPointEnabled = wallRunTs.tempData["wallRunIsCheckPointEnabled"];
      wallRunTs.tempData["wallRunIsCheckPointEnabled"] = !isCheckPointEnabled;
      util.sendMessage(`§aCheckpoint is now ${!isCheckPointEnabled ? "§aEnabled!" : "§cDisabled!"}`, "random.orb");
    }
  }

  // reset pb
  if (selection === 13) {
    util.resetPB(player, "Wall_Run");
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
  const { player, gameID } = wallRunTs.commonData;

  util.displayScoreboard("Wall_Run");

  if (player.location.z > 30140) return util.teleportation(gameID);

  if (!(player.location.y < 98) || player.getGameMode() === mc.GameMode.spectator) return;

  if (wallRunTs.tempData["isCheckPointSaved"]) {
    // going back to checkpoint
    util.sendMessage("§7Teleporting back to the checkpoint...");
    player.teleport({ x: 30009.5, y: 106, z: 30077.5 }, { facingLocation: { x: 30009.5, y: 106, z: 30078 } });
    util.giveItems("Wall_Run");
    wallRunTs.clearBlocks();
  } else {
    enablePlate();
    util.onRunnerFail("Wall_Run");
  }
};
