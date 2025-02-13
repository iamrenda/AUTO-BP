import * as mc from "@minecraft/server";
import { BridgerTypesID, BundlableGameModeID, DynamicPropertyID } from "../models/DynamicProperty";
import { getInvData, locationData, VERSION } from "../data/staticData";
import TeleportationLocation from "../models/TeleportationLocation";
import GameID from "../models/GameID";
import { bridgerTs, generalTs, TempStorage } from "../data/tempStorage";
import * as scoreboard from "./scoreboard";
import * as goalMessage from "./goalMessage";
import { clearBlocksForm, confirmationForm } from "../forms/utility";
import {
  BaseGameData,
  BedwarsRushData,
  BridgerData,
  DynamicProperty,
  ParkourData,
  StoredBlocksClass,
  WallRunData,
} from "../data/dynamicProperty";

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
 * attempts to teleport player
 */
export const teleportation = function (loc: TeleportationLocation): void {
  const attemptTeleport = () => {
    const teleport = generalTs.commonData["player"].tryTeleport(loc.position, { facingLocation: loc.facing });

    if (!teleport) {
      sendMessage("§cFailed to teleport. Trying again.", "random.anvil_land");
      mc.system.runTimeout(attemptTeleport, 60);
    }
  };

  attemptTeleport();
};

/**
 * confirmMessage: show message with sound
 */
export const sendMessage = function (message: string = "", sound: string = ""): void {
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
 * sets bridger mode
 */
export const setBridgerMode = function (game: BridgerTypesID): void {
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
  return ticks === -1 ? "--.--" : (ticks / 20).toFixed(2);
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
    parkour1_1: scoreboard.parkourScoreboard,
    parkour1_2: scoreboard.parkourScoreboard,
    parkour1_3: scoreboard.parkourScoreboard,
  };

  const display = scoreboards[gameId];
  generalTs.commonData["player"].onScreenDisplay.setActionBar(display());
};

/**
 * back to lobby
 */
export const backToLobbyKit = function (player: mc.Player, tempDataClass: TempStorage) {
  generalTs.stopTimer();
  generalTs.commonData["gameID"] = "lobby";
  generalTs.commonData["ticks"] = 0;
  tempDataClass.tempData = tempDataClass.setDefaultTempData();
  tempDataClass.clearBlocks();
  player.setGameMode(mc.GameMode.survival);
  DynamicProperty.postData();
  giveItems("lobby");
  displayScoreboard("lobby");
  teleportation(locationData.lobby);
};

/**
 * floating entity grabber
 */
export const getFloatingEntity = function (): mc.Entity {
  switch (generalTs.commonData["gameID"]) {
    case "straightBridger":
      return mc.world.getDimension("overworld").getEntities({
        location: { x: 9997.91, y: 101.59, z: 10004.76 },
        excludeFamilies: ["player"],
      })[0];
    case "inclinedBridger":
      return mc.world.getDimension("overworld").getEntities({
        location: { x: 9963.6, y: 100.0, z: 10000.8 },
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
    case "parkour1_1":
      return mc.world.getDimension("overworld").getEntities({
        location: { x: 60049.04, y: 85.0, z: 60084.73 },
        excludeFamilies: ["player"],
      })[0];
    case "parkour1_2":
      return mc.world.getDimension("overworld").getEntities({
        location: { x: 60041.96, y: 101.0, z: 60061.3 },
        excludeFamilies: ["player"],
      })[0];
    case "parkour1_3":
      return mc.world.getDimension("overworld").getEntities({
        location: { x: 60072.82, y: 79.0, z: 60058.43 },
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
  const displayText = `§b${player.nameTag} §7§o- Version ${VERSION}§r
§6Personal Best: §f${tickToSec(pb)}
§6Average Time: §f${tickToSec(avgTime)}
§6Attempts: §f${attempts}
§6Successful Attempts: §f${successAttempts}`;

  getFloatingEntity().nameTag = displayText;
};

/**
 * shows the result of a run
 */
export const showMessage = function (isPB: boolean, time: number, prevPB: number): void {
  const { gameID, player } = generalTs.commonData;

  switch (gameID) {
    case "straightBridger":
    case "inclinedBridger":
      player.sendMessage(goalMessage.bridgerMessage(isPB, time, prevPB));
      break;

    case "wallRun":
      player.sendMessage(goalMessage.wallRunMessage(isPB, time, prevPB));
      break;

    case "parkour1_1":
    case "parkour1_2":
    case "parkour1_3":
      player.sendMessage(goalMessage.parkourMessage(isPB, time, prevPB));
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
  sendMessage("§aWe have cleared the blocks!", "random.orb");
};

/**
 * shows title bar (optional: subtitle)
 */
export const showTitleBar = function (
  player: mc.Player,
  title: string,
  displayOption: { fadeInDuration?: number; fadeOutDuration?: number; stayDuration?: number; subtitle?: string } = {
    fadeInDuration: 20,
    fadeOutDuration: 20,
    stayDuration: 60,
    subtitle: "",
  }
) {
  const { fadeInDuration = 20, fadeOutDuration = 20, stayDuration = 60, subtitle = "" } = displayOption;
  player.onScreenDisplay.setTitle(title, { fadeInDuration, fadeOutDuration, stayDuration });
  if (subtitle) player.onScreenDisplay.updateSubtitle(subtitle);
};

// when accessing DynamicPropertyID
const bundlableGameModeIDs = new Map<BaseGameData, BundlableGameModeID>([
  [BridgerData, "Bridger"],
  [BedwarsRushData, "BedwarsRush"],
  [WallRunData, "WallRunner"],
  [ParkourData, "Parkour"],
]);

// after req timeout finished
export const afterReq = function (dataBase: typeof BaseGameData, plateEnable: () => void) {
  const gameModeString = bundlableGameModeIDs.get(dataBase);
  const { player, gameID } = generalTs.commonData;

  generalTs.clearBlocks();
  player.setGameMode(mc.GameMode.survival);
  generalTs.commonData["blocks"] = 0;
  plateEnable();
  giveItems(gameID);
  teleportation(<TeleportationLocation>locationData[gameID]);
  updateFloatingText(dataBase.getBundledData(gameModeString));
};

/**
 * when the player gets a successful run
 * @param {function} plateEnable: a fn to enable plate
 */
export const onRunnerSuccess = function (
  ts: TempStorage,
  dataBase: typeof BaseGameData,
  plateEnable: () => void
): void {
  const gameModeString = bundlableGameModeIDs.get(dataBase);

  const {
    pb: prevPB,
    avgTime: prevAvgTime,
    successAttempts: prevSuccessAttempts,
  } = dataBase.getBundledData(gameModeString);

  const player = generalTs.commonData["player"];
  const time = generalTs.commonData["ticks"];

  // stop timer
  ts.stopTimer();

  // add attempts and success attempts
  dataBase.addData(<DynamicPropertyID>`${gameModeString}_Attempts`);
  dataBase.addData(<DynamicPropertyID>`${gameModeString}_SuccessAttempts`);

  // set pb
  if (isPB(prevPB, time)) {
    showMessage(true, time, prevPB);
    dataBase.setData(<DynamicPropertyID>`${gameModeString}_PB`, time);
    showTitleBar(player, `§6Time§7: §f${tickToSec(time)}§r`, { subtitle: "§dNEW RECORD!!!" });
    player.playSound("random.levelup");
  } else {
    showTitleBar(player, `§6Time§7: §f${tickToSec(time)}§r`);
    showMessage(false, time, prevPB);
  }

  // set avg time
  const newAvgTime = prevAvgTime === -1 ? time : (prevAvgTime * prevSuccessAttempts + time) / (prevSuccessAttempts + 1);
  dataBase.setData(<DynamicPropertyID>`${gameModeString}_AverageTime`, Math.round(newAvgTime * 100) / 100);

  // shoot fireworks
  shootFireworks(player.location);

  // auto req
  ts.tempData["autoReq"] = mc.system.runTimeout(afterReq.bind(null, dataBase, plateEnable), 80);
};

/**
 * when the player gets a fail run
 */
export const onRunnerFail = function (dataBase: typeof BaseGameData, addAttempt = true) {
  const gameModeString = bundlableGameModeIDs.get(dataBase);
  const gameID = generalTs.commonData["gameID"];

  generalTs.stopTimer();
  generalTs.clearBlocks();
  generalTs.commonData["blocks"] = 0;
  if (addAttempt) dataBase.addData(<DynamicPropertyID>`${gameModeString}_Attempts`);
  updateFloatingText(dataBase.getBundledData(gameModeString));
  giveItems(gameID);
  teleportation(<TeleportationLocation>locationData[gameID]);
};

/**
 * reset pb
 */
export const resetPB = async function (
  player: mc.Player,
  dataBase: typeof BaseGameData,
  formTitle: string,
  bundlableGameModeID: BundlableGameModeID
) {
  const { selection: confirmationSelection } = await confirmationForm(player, formTitle);
  if (confirmationSelection !== 15) return;

  const gameModeString = bundlableGameModeIDs.get(dataBase);
  dataBase.setData(<DynamicPropertyID>`${gameModeString}_PB`, -1);
  sendMessage("§aSuccess! Your personal best score has been reset!", "random.orb");
  updateFloatingText(dataBase.getBundledData(bundlableGameModeID));
};

/**
 * if uncleared block detected, it shows the warning
 */
export const warnUnclearedBlocks = function (player: mc.Player): void {
  if (generalTs.commonData["storedLocationsGameID"] !== generalTs.commonData["gameID"]) return;
  sendMessage(`§a§lWe have detected uncleared blocks. Right-click on the book to clear them!!`);
  showTitleBar(player, "§cUncleared blocks Detected");
};
