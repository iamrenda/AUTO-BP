import * as mc from "@minecraft/server";
import * as scoreboard from "./scoreboard";
import { getInventoryData, locationData, VERSION } from "../data/staticData";
import GameID, { BundlableGameID, ParentGameID, SubCategory } from "../models/GameID";
import { bridgerTs, generalTs, TempStorage } from "../data/tempStorage";
import { confirmationForm } from "../forms/utility";
import { BaseGameData, DynamicProperty } from "../data/dynamicProperty";
import { ItemInfo } from "../models/general";

/**
 * giveItems: clears inventory and gives item with lockmode (optional: assigned slot)
 */
export const giveItems = function (info: ParentGameID | ItemInfo[]): void {
  const player = generalTs.commonData["player"];
  const container = player.getComponent("inventory").container;
  const itemArr = Array.isArray(info) ? info : getInventoryData(info);

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
export const teleportation = function (gameID: GameID): void {
  const attemptTeleport = () => {
    const location = locationData[gameID];
    const teleport = generalTs.commonData["player"].tryTeleport(location.position, { facingLocation: location.facing });

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
export const sendMessage = function (message: string, sound: string = ""): void {
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
const scoreboards: Record<ParentGameID, () => string> = {
  Lobby: scoreboard.lobbyScoreboard,
  Bridger: scoreboard.bridgerScoreboard,
  Clutcher: scoreboard.clutcherScoreboard,
  Wall_Run: scoreboard.wallRunScoreboard,
  Bedwars_Rush: scoreboard.bedwarsRushScoreboard,
  Fist_Reduce: scoreboard.fistReduceScoreboard,
  Parkour: scoreboard.parkourScoreboard,
  Wool_Parkour: scoreboard.woolParkourScoreboard,
};
export const displayScoreboard = function (parentGameID: ParentGameID): void {
  const display = scoreboards[parentGameID];
  generalTs.commonData["player"].onScreenDisplay.setActionBar(display());
};

/**
 * back to lobby
 */
export const backToLobbyKit = function (player: mc.Player, tempDataClass: TempStorage) {
  generalTs.stopTimer();
  generalTs.commonData["gameID"] = "Lobby";
  generalTs.commonData["ticks"] = 0;
  tempDataClass.tempData = tempDataClass.setDefaultTempData();
  tempDataClass.clearBlocks();
  player.setGameMode(mc.GameMode.survival);
  DynamicProperty.postData();
  giveItems("Lobby");
  displayScoreboard("Lobby");
  teleportation("Lobby");
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
 * goal messsage handling
 */
// goal message subcategory name
const subCategoryText: Record<BundlableGameID, string> = {
  Bridger: "Distance",
  Bedwars_Rush: "Map",
  Parkour: "Map",
  Wall_Run: "Map",
  Wool_Parkour: "Map",
};

export const showGoalMessage = function (
  bundlableGameID: BundlableGameID,
  isPB: boolean,
  timeTicks: number,
  prevPBTicks: number
): void {
  const subCategory = getCurrentSubCategory();
  const pb = BaseGameData.getData(bundlableGameID, subCategory, "pbTicks");
  const differenceText =
    pb !== -1 ? "§f(" + (isPB ? differenceMs(prevPBTicks, timeTicks) : differenceMs(pb, timeTicks)) + "§f)" : "";

  const baseMessage = `§7----------------------------§r 
    §b${toProperName(bundlableGameID)}§r §8§o- Version ${VERSION}§r
      
    §6${subCategoryText[bundlableGameID]}: §f${toProperName(subCategory)}
    §6${isPB ? "Your Previous Best" : "Your Personal Best"}:§r §f${tickToSec(isPB ? prevPBTicks : pb)}§f
    §6Time Recorded:§r §f${tickToSec(timeTicks)}§r ${differenceText}§r`;

  const pbMessage = isPB ? `    §d§lNEW PERSONAL BEST!!§r\n` : "";

  sendMessage(`${baseMessage}\n${pbMessage}§7----------------------------`);
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

// after req timeout finished
export const afterReq = function (parentGameID: ParentGameID, plateEnable: () => void) {
  const { player, gameID } = generalTs.commonData;

  generalTs.clearBlocks();
  player.setGameMode(mc.GameMode.survival);
  generalTs.commonData["blocks"] = 0;
  plateEnable();
  giveItems(parentGameID);
  teleportation(gameID);
};

/**
 * when the player gets a successful run
 * @param {function} plateEnable: a fn to enable plate
 */
export const onRunnerSuccess = function (
  bundlableGameID: BundlableGameID,
  ts: TempStorage,
  plateEnable: () => void
): void {
  const { ticks, player } = ts.commonData;
  const subCategory = getCurrentSubCategory();
  const {
    pbTicks: prevPB,
    avgTicks: prevAvgTime,
    successAttempts: prevSuccessAttempts,
  } = BaseGameData.getBundledData(bundlableGameID, subCategory);

  // stop timer
  ts.stopTimer();

  // add attempts and success attempts
  BaseGameData.addData(bundlableGameID, subCategory, "attempts");
  BaseGameData.addData(bundlableGameID, subCategory, "successAttempts");

  // set pb
  if (isPB(prevPB, ticks)) {
    showGoalMessage(bundlableGameID, true, ticks, prevPB);
    BaseGameData.setData(bundlableGameID, subCategory, "pbTicks", ticks);
    showTitleBar(player, `§6Time§7: §f${tickToSec(ticks)}§r`, { subtitle: "§dNEW RECORD!!!" });
    player.playSound("random.levelup");
  } else {
    showTitleBar(player, `§6Time§7: §f${tickToSec(ticks)}§r`);
    showGoalMessage(bundlableGameID, false, ticks, prevPB);
  }

  // set avg time
  const newAvgTime =
    prevAvgTime === -1 ? ticks : (prevAvgTime * prevSuccessAttempts + ticks) / (prevSuccessAttempts + 1);
  BaseGameData.setData(bundlableGameID, subCategory, "avgTicks", Math.round(newAvgTime * 100) / 100);

  // shoot fireworks
  shootFireworks(player.location);

  // auto req
  ts.tempData["autoReq"] = mc.system.runTimeout(afterReq.bind(null, bundlableGameID, plateEnable), 80);
};

/**
 * when the player gets a fail run
 */
export const onRunnerFail = function <T extends BundlableGameID>(
  bundlableGameID: T,
  enablePlate: () => void,
  addAttempt = true
) {
  const gameID = generalTs.commonData["gameID"];
  const subCategory = getCurrentSubCategory();

  if (addAttempt) {
    BaseGameData.addData(bundlableGameID, subCategory, "attempts");
  }

  if (enablePlate) {
    enablePlate();
  }

  generalTs.stopTimer();
  generalTs.clearBlocks();
  generalTs.commonData["blocks"] = 0;
  giveItems(bundlableGameID);
  teleportation(gameID);
};

/**
 * reset pb
 */
export const resetPB = async function <T extends BundlableGameID>(player: mc.Player, bundlableGameID: T) {
  const { selection: confirmationSelection } = await confirmationForm(player, toProperName(bundlableGameID));
  const subCategory = getCurrentSubCategory();
  if (confirmationSelection !== 15) return;

  BaseGameData.setData(bundlableGameID, subCategory, "pbTicks", -1);
  sendMessage("§aSuccess! Your personal best score has been reset!", "random.orb");
};

/**
 * gets the parent category based on the gameID (If there's a `$`, return everything after it. If there's no `$`, return the original string.)
 */
export const getCurrentSubCategory = function (): SubCategory<BundlableGameID> {
  const { gameID } = generalTs.commonData;
  const split = gameID.split("$");
  return <SubCategory<BundlableGameID>>split[1] ?? undefined;
};

/**
 * gets the parent category based on the gameID (If there's a `$`, return everything after it. If there's no `$`, return the original string.)
 */
export const getCurrentParentCategory = function (): ParentGameID {
  const { gameID } = generalTs.commonData;
  const split = gameID.split("$");
  return <ParentGameID>split[0] ?? undefined;
};

/**
 * _ to " "
 */
export const toProperName = function (input: string): string {
  return input.replace(/_/g, " ");
};

/**
 * attempts to clear blocks from storedLocations until success
 */
export const retryClearBlocks = function (storedlocations: Set<mc.Vector3>, isFirstAttempt: boolean = true) {
  if (!storedlocations.size) return;
  let failedLocations = new Set<mc.Vector3>();
  const breakingAnimation = bridgerTs.tempData["breakingAnimation"];
  const dimension = mc.world.getDimension("overworld");
  const locationsArray = [...storedlocations];
  let currentIndex = 0;
  let dominoAnimationTimer: number;

  switch (breakingAnimation) {
    case "Falling Domino":
      dominoAnimationTimer = mc.system.runInterval(() => {
        if (currentIndex >= locationsArray.length) {
          mc.system.clearRun(dominoAnimationTimer);
          return;
        }

        const location = locationsArray[currentIndex];
        try {
          dimension.setBlockType(location, "minecraft:air");
          dimension.spawnEntity("auto:custom_sand", { x: location.x + 0.5, y: location.y, z: location.z });
        } catch (err) {
          failedLocations.add(location);
        }

        currentIndex++;
      }, 1);
      break;

    case "Domino":
      dominoAnimationTimer = mc.system.runInterval(() => {
        if (currentIndex >= locationsArray.length) {
          mc.system.clearRun(dominoAnimationTimer);
          return;
        }

        const location = locationsArray[currentIndex];
        try {
          dimension.setBlockType(location, "minecraft:air");
        } catch (err) {
          failedLocations.add(location);
        }

        currentIndex++;
      }, 1);
      break;

    case "Falling":
      locationsArray.forEach((location) => {
        try {
          dimension.setBlockType(location, "minecraft:air");
          dimension.spawnEntity("auto:custom_sand", { x: location.x + 0.5, y: location.y, z: location.z });
        } catch (err) {
          failedLocations.add(location);
        }
      });
      break;

    default:
      locationsArray.forEach((location) => {
        try {
          dimension.setBlockType(location, "minecraft:air");
        } catch (err) {
          failedLocations.add(location);
        }
      });
  }

  if (failedLocations.size > 0) {
    if (isFirstAttempt) {
      sendMessage("§cUnable to clear some blocks. Trying again...");
    }
    mc.system.runTimeout(() => retryClearBlocks(failedLocations, false), 20);
  } else {
    if (!isFirstAttempt) {
      sendMessage("§aSuccess.");
    }
    generalTs.commonData["storedLocations"] = new Set();
  }
};
