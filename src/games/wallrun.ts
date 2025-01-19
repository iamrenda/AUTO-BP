import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import * as form from "../forms/wallrun";
import TeleportationLocation from "../models/TeleportationLocation";
import { wallRunTs } from "../data/tempStorage";
import { DynamicPropertyID } from "../models/DynamicProperty";
import { locationData, VERSION } from "../data/staticData";
import { WallRunData } from "../data/dynamicProperty";
import { confirmationForm } from "../forms/utility";

/**
 * updates the floating texts including stats about the player
 */
const updateFloatingText = function () {
  const pbData = WallRunData.getData(DynamicPropertyID.WallRunner_PB);
  const avgTimeData = WallRunData.getData(DynamicPropertyID.WallRunner_AverageTime);
  const info = {
    pb: util.pbText(pbData),
    avgTime: avgTimeData === -1 ? "--.--" : util.tickToSec(avgTimeData),
    attempts: WallRunData.getData(DynamicPropertyID.WallRunner_Attempts),
    successAttempts: WallRunData.getData(DynamicPropertyID.WallRunner_SuccessAttempts),
  };

  const displayText = `§b${wallRunTs.commonData["player"].nameTag}§r
§6Personal Best:§r §f${info.pb}§r
§6Average Time:§r §f${info.avgTime}§r
§6Attempts:§r §f${info.attempts}§r
§6Successful Attempts:§r §f${info.successAttempts}§r`;

  util.getFloatingEntity().nameTag = displayText;
};

/**
 * disables the plate if not disabled; returns true or false depending on availiability
 */
const isPlateDisabled = function (plate: "first" | "checkpoint" | "goal"): boolean {
  if (wallRunTs.tempData["isPlateDisabled"][plate]) return true;
  wallRunTs.tempData["isPlateDisabled"][plate] = true;
  return false;
};

const resetWallRunner = function () {
  wallRunTs.commonData["ticks"] = 0;
  wallRunTs.tempData["isCheckPointSaved"] = false;

  Object.keys(wallRunTs.tempData["isPlateDisabled"]).map(
    (plate) =>
      (wallRunTs.tempData["isPlateDisabled"][plate as keyof (typeof wallRunTs.tempData)["isPlateDisabled"]] = false)
  );
};

/**
 * resets map
 */
const resetMap = function () {
  wallRunTs.stopTimer();
  resetWallRunner();
  updateFloatingText();
  wallRunTs.clearBlocks();
  util.giveItems("wallRun");
  util.teleportation(<TeleportationLocation>locationData.wallRun);
};

const showMessage = function (wasPB: boolean, prevPB?: number): void {
  const getMessage = (pb: number, time: number, waspb = false) => {
    const baseMessage = `
§7----------------------------§r 
  §bWallrun§r §8§o- Version ${VERSION}§r

  §6${waspb ? "Your Previous Best" : "Your Personal Best"}:§r §f${
      pb === -1 ? "--.--" : util.tickToSec(waspb ? prevPB : pb)
    }§f
  §6Time Recorded:§r §f${util.tickToSec(time)}§r ${
      pb !== -1 ? "§f(" + (wasPB ? util.differenceMs(prevPB, time) : util.differenceMs(pb, time)) + "§f)" : ""
    }§r`;

    const pbMessage = waspb ? `  §d§lNEW PERSONAL BEST!!§r\n` : "";
    return `${baseMessage}\n${pbMessage}§7----------------------------`;
  };
  const pb = WallRunData.getData(DynamicPropertyID.WallRunner_PB);
  const message = getMessage(pb, wallRunTs.commonData["ticks"], wasPB);
  wallRunTs.commonData["player"].sendMessage(message);
};

const setAverageTime = function (newTime: number) {
  const prevAvgTime = WallRunData.getData(DynamicPropertyID.WallRunner_AverageTime);
  const attempts = WallRunData.getData(DynamicPropertyID.WallRunner_Attempts);
  const newAvgTime = prevAvgTime === -1 ? newTime : (prevAvgTime * attempts + newTime) / (attempts + 1);

  WallRunData.setData(DynamicPropertyID.WallRunner_AverageTime, Math.round(newAvgTime * 100) / 100);
};

/**
 * re-enable pressure plate (disabled temp when plate is pressed)
 * @param {Boolean} cancelTimer - whether canceling timer to resetMap is necessary or not
 */
const enablePlate = function (): void {
  wallRunTs.tempData["isPlateDisabled"].goal = false;
  wallRunTs.commonData["player"].setGameMode(mc.GameMode.survival);
  util.giveItems("wallRun");
  resetMap();
};

/////////////////////////////////////////////////////////////////////////
export const pressurePlatePushEvt = function ({ location }: { location: mc.Vector3 }) {
  switch (location.z) {
    // start
    case 30016:
      if (isPlateDisabled("first")) return;
      WallRunData.addData(DynamicPropertyID.WallRunner_Attempts);
      wallRunTs.commonData["timer"] = mc.system.runInterval(
        () => wallRunTs.commonData["timer"] && wallRunTs.commonData["ticks"]++
      );
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
      wallRunTs.stopTimer();
      wallRunTs.clearBlocks();

      player.onScreenDisplay.setTitle(`§6Time§7: §f${util.tickToSec(wallRunTs.commonData["ticks"])}§r`);
      player.setGameMode(mc.GameMode.spectator);

      if (util.isPB(WallRunData.getData(DynamicPropertyID.WallRunner_PB), wallRunTs.commonData["ticks"])) {
        WallRunData.setData(DynamicPropertyID.WallRunner_PB, wallRunTs.commonData["ticks"]);
        showMessage(true, WallRunData.getData(DynamicPropertyID.WallRunner_PB));
        player.playSound("random.levelup");
        player.onScreenDisplay.updateSubtitle("§dNEW RECORD!!!");
      } else showMessage(false);

      setAverageTime(wallRunTs.commonData["ticks"]);

      mc.world.getDimension("overworld").spawnEntity("fireworks_rocket", player.location);
      wallRunTs.tempData["autoReq"] = mc.system.runTimeout(enablePlate, 80);

      WallRunData.addData(DynamicPropertyID.WallRunner_Attempts);
      WallRunData.addData(DynamicPropertyID.WallRunner_SuccessAttempts);
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
      util.confirmMessage(`Checkpoint is now ${!isCheckPointEnabled ? "§aEnabled!" : "§cDisabled!"}`, "random.orb");
    }
  }

  // reset pb
  if (selection === 14) {
    const { selection: confirmationSelection } = await confirmationForm(player, `Wall Run`);
    if (confirmationSelection !== 15) return;

    WallRunData.setData(DynamicPropertyID.WallRunner_PB, -1);
    util.confirmMessage("§aSuccess! Your personal best score has been reset!", "random.orb");
    updateFloatingText();
  }

  // back to lobby
  if (selection === 16) {
    wallRunTs.clearBlocks();
    util.backToLobbyKit();
  }
};

export const placingBlockEvt = function ({ location }: { location: mc.Vector3 }) {
  wallRunTs.commonData["storedLocations"].add(location);
};

export const listener = function () {
  const player = wallRunTs.commonData["player"];
  // const progress = Math.max(0, +(((player.location.z - 30016) / 105) * 100).toFixed(0));

  util.displayScoreboard("wallRun");

  if (!(player.location.y < 98) || player.getGameMode() === mc.GameMode.spectator) return;
  if (wallRunTs.tempData["isCheckPointSaved"]) {
    util.confirmMessage("§7Teleporting back to the checkpoint...");
    util.teleportation({ position: { x: 30009.5, y: 106, z: 30077.5 }, facing: { x: 30009.5, y: 106, z: 30078 } });
    util.giveItems("wallRun");
    wallRunTs.clearBlocks();
  } else resetMap();
};
