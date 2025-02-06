import * as mc from "@minecraft/server";
import { BridgerTicksID } from "../models/DynamicProperty";
import { getInvData, locationData, VERSION } from "../data/staticData";
import TeleportationLocation from "../models/TeleportationLocation";
import GameID from "../models/GameID";
import { bridgerTs, generalTs } from "../data/tempStorage";
import * as scoreboard from "../data/scoreboard";
import * as goalMessage from "../data/goalMessage";
import { clearBlocksForm } from "../forms/utility";
import { StoredBlocksClass } from "../data/dynamicProperty";

/**
 * giveItems: clears inventory and gives item with lockmode (optional: assigned slot)
 */
export const giveItems = function (gameid: GameID): void {
  const player = generalTs.commonData["player"];
  const container = player.getComponent("inventory").container;
  const itemArr = getInvData(gameid);

  container.clearAll();

  for (const { item, quantity, slot, name = "" } of itemArr) {
    const i = new mc.ItemStack(item, quantity);
    i.lockMode = mc.ItemLockMode.inventory;
    if (name) i.nameTag = name;
    slot ? container.setItem(slot, i) : container.addItem(i);
  }
};

/**
 * teleportation: teleport player
 */
export const teleportation = function (loc: TeleportationLocation): void {
  generalTs.commonData["player"].teleport(loc.position, { facingLocation: loc.facing });
};

/**
 * confirmMessage: show message with sound
 */
export const confirmMessage = function (message: string = "", sound: string = ""): void {
  const player = generalTs.commonData["player"];
  if (message) player.sendMessage(message);
  if (sound) player.playSound(sound);
};

/**
 * returns todays date
 */
const date = new Date();
export const today = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(
  2,
  "0"
)}/${String(date.getFullYear()).slice(-2)}`;

/**
 * sets bridger mode "straight16b", "straight21b", "straight50b", "inclined16b", "inclined21b", "inclined50b",
 */
export const setBridgerMode = function (game: BridgerTicksID): void {
  bridgerTs.tempData["bridgerMode"] = game;
};

/**
 * get the distance (rounded) between 2 location vector3 (ignoring y vector)
 */
export const calculateDistance = function (location1: mc.Vector3, location2: mc.Vector3): number {
  if (!location1 || !location2) return 0;
  const dx = location2.x - location1.x;
  const dz = location2.z - location1.z;
  return Math.round(Math.sqrt(dx * dx + dz * dz));
};

/**
 * converts from tick to seconds
 */
export const tickToSec = function (ticks: number): string {
  return (ticks / 20).toFixed(2);
};

/**
 * display time as text but if time undefined, it will show as "--:--"
 */
export const properTimeText = function (ticks: number): string {
  return ticks === -1 ? "--.--" : tickToSec(ticks);
};

/**
 * display lobby scoreboard
 */
export const displayScoreboard = function (gameId: GameID): void {
  const scoreboards = {
    lobby: scoreboard.lobbyScoreboard,
    straightBridger: scoreboard.bridgerScoreboard,
    inclinedBridger: scoreboard.bridgerScoreboard,
    clutcher: scoreboard.clutcherScoreboard,
    wallRun: scoreboard.wallRunScoreboard,
    bedwarsRush: scoreboard.bedwarsRushScoreboard,
    normalFistReduce: scoreboard.fistReduceScoreboard,
    limitlessFistReduce: scoreboard.fistReduceScoreboard,
  };

  const display = scoreboards[gameId];
  generalTs.commonData["player"].onScreenDisplay.setActionBar(display());
};

/**
 * back to lobby
 */
export const backToLobbyKit = function (player: mc.Player) {
  generalTs.stopTimer();
  generalTs.commonData["gameID"] = "lobby";
  generalTs.commonData["ticks"] = 0;
  player.setGameMode(mc.GameMode.survival);
  giveItems("lobby");
  displayScoreboard("lobby");
  teleportation(locationData.lobby);
};

/**
 * floating entity grabber
 */
export const getFloatingEntity = function (): mc.Entity {
  switch (generalTs.commonData["gameID"]) {
    case "lobby":
      break;
    case "straightBridger":
      return mc.world.getDimension("overworld").getEntities({
        location: { x: 9997.91, y: 101.59, z: 10004.76 },
        excludeFamilies: ["player"],
      })[0];
    case "inclinedBridger":
      return mc.world.getDimension("overworld").getEntities({
        location: { x: 9960.73, y: 100.97, z: 10003.64 },
        excludeFamilies: ["player"],
      })[0];
    case "wallRun":
      return mc.world.getDimension("overworld").getEntities({
        location: { x: 30007.61, y: 106.12, z: 30015.16 },
        excludeFamilies: ["player"],
      })[0];
    case "bedwarsRush":
      return mc.world.getDimension("overworld").getEntities({
        location: { x: 40093.53, y: 102.19, z: 40032.97 },
        excludeFamilies: ["player"],
      })[0];
  }
};

/**
 * returns boolean whether given time is faster than pb
 */
export const isPB = function (pb: number, time: number): boolean {
  return pb === -1 || time < pb;
};

/**
 * takes the difference in ms and returns it in seconds (string format)
 */
export const differenceMs = function (ms1: number, ms2: number): string {
  const difference = ms1 - ms2;
  if (difference === 0) return "±0.00";
  return difference < 0 ? `§c+${tickToSec(Math.abs(difference))}` : `§a-${tickToSec(difference)}`;
};

/**
 * updates the floating texts including stats about the player
 */
type FloatingTextParams = {
  pb: number;
  avgTime: number;
  attempts: number;
  successAttempts: number;
};
export const updateFloatingText = function ({ pb, avgTime, attempts, successAttempts }: FloatingTextParams) {
  const player = generalTs.commonData["player"];
  const displayText = `§b${player.nameTag} - §7§oVersion ${VERSION}§r
§6Personal Best: §f${properTimeText(pb)}
§6Average Time: §f${properTimeText(avgTime)}
§6Attempts: §f${attempts}
§6Successful Attempts: §f${successAttempts}`;

  getFloatingEntity().nameTag = displayText;
};

/**
 * shows the result of the bridging
 */
export const showMessage = function (isPB: boolean, time: number, prevPB: number): void {
  const gameId = generalTs.commonData["gameID"];
  switch (gameId) {
    case "straightBridger":
    case "inclinedBridger":
      generalTs.commonData["player"].sendMessage(goalMessage.bridgerMessage(isPB, time, prevPB));
      break;
    case "wallRun":
      generalTs.commonData["player"].sendMessage(goalMessage.wallRunMessage(isPB, time, prevPB));
      break;
  }
};

/**
 * shoot fireworks dynamically
 */
export const shootFireworks = function (location: mc.Vector3): void {
  const dimension = mc.world.getDimension("overworld");
  dimension.spawnEntity("fireworks_rocket", { x: location.x + 2, y: location.y, z: location.z });
  dimension.spawnEntity("fireworks_rocket", { x: location.x - 2, y: location.y, z: location.z });
  dimension.spawnEntity("fireworks_rocket", { x: location.x, y: location.y, z: location.z + 2 });
  dimension.spawnEntity("fireworks_rocket", { x: location.x, y: location.y, z: location.z - 2 });
};

/**
 * attempts to show clearing blocks if there is uncleared blocks
 * @return boolean whether the form is shown or not
 */
export const clearBlocks = async function (player: mc.Player) {
  const { selection } = await clearBlocksForm(player);
  if (selection !== 13) return;

  StoredBlocksClass.clearBlocks();
  confirmMessage("§aWe have cleared the blocks!", "random.orb");
};

/**
 * shows title bar (optional: subtitle)
 */
export const showTitleBar = function (player: mc.Player, title: string, subtitle?: string) {
  player.onScreenDisplay.setTitle(title);
  if (subtitle) player.onScreenDisplay.updateSubtitle(subtitle);
};
