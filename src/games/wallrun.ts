import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import * as form from "../forms/wallrun";
import ts from "../utilities/tempStorage";
import TeleportationLocation from "../models/TeleportationLocation";
import { locationData, VERSION } from "../utilities/staticData";

type WallRunner = {
  timer: number;
  ticks: number;
  storedLocations: Set<mc.Vector3>;
  isPlateDisabled: { first: boolean; checkpoint: boolean; goal: boolean };
  isCheckPointEnabled: boolean;
  isCheckPointSaved: boolean;
  autoReq?: number;
};

const wallRunner: WallRunner = {
  timer: null,
  ticks: 0,
  storedLocations: new Set(),
  isPlateDisabled: {
    first: false,
    checkpoint: false,
    goal: false,
  },
  isCheckPointEnabled: true,
  isCheckPointSaved: false,
  autoReq: null,
};

/**
 * stops the timer
 */
const stopTimer = function () {
  if (!wallRunner.timer) return;
  mc.system.clearRun(wallRunner.timer);
  wallRunner.timer = null;
};

/**
 * disables the plate if not disabled; returns true or false depending on availiability
 */
const isPlateDisabled = function (plate: "first" | "checkpoint" | "goal"): boolean {
  if (wallRunner.isPlateDisabled[plate]) return true;
  wallRunner.isPlateDisabled[plate] = true;
  return false;
};

const resetWallRunner = function () {
  wallRunner.ticks = 0;
  wallRunner.isCheckPointSaved = false;
  Object.keys(wallRunner.isPlateDisabled).map((plate) => (wallRunner[plate] = false));
};

/**
 * resets map
 */
const resetMap = function () {
  stopTimer();
  resetWallRunner();
  util.teleportation(<TeleportationLocation>locationData.wallRun);
};

/////////////////////////////////////////////////////////////////////////
export const pressurePlatePushEvt = function ({ location }) {
  switch (location.z) {
    // start
    case 30016:
      if (isPlateDisabled("first")) return;
      wallRunner.timer = mc.system.runInterval(() => wallRunner.timer && wallRunner.ticks++);
      break;

    // checkpoint
    case 30075:
      if (isPlateDisabled("checkpoint")) return;
      break;

    // goal
    case 30121:
      if (isPlateDisabled("goal")) return;
      stopTimer();
      break;
  }
};

export const wallRunFormHandler = async function (player: mc.Player) {
  const { selection } = await form.wallRunForm(player);

  // back to lobby
  if (selection === 16) util.backToLobbyKit(player);
};

export const listener = function () {
  const progress = Math.max(0, +(((ts.getData("player").location.z - 30016) / 105) * 100).toFixed(0));

  ts.getData("player").onScreenDisplay.setActionBar(
    `     §b§lAUTO World§r
§7-------------------§r
§7 - §6Personal Best:§r
§f   69.420

§7 - §6Time:§r
§f   ${util.tickToSec(wallRunner.ticks)}

§7 - §6Progress:§r
§f   ${progress}%
§7-------------------§r
§8§oVersion ${VERSION} | ${util.today}`
  );

  if (!(ts.getData("player").location.y < 98)) return;

  resetMap();
};

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
// import { DynamicProperty } from "../utilities/dynamicProperty";

mc.world.afterEvents.chatSend.subscribe(({ sender: player }) => {
  player.sendMessage("player defined");
  //////////////////////////////////////////////////
  // make sure to go back to lobby before reloading
  // debug from here
  ts.setData("player", player);
  mc.world.sendMessage(String(mc.world.getDynamicProperty("auto:dynamicData")));
});
