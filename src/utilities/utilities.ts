import { world, ItemLockMode, ItemStack, Player, Vector3 } from "@minecraft/server";
import tempData from "./tempData";
import ItemInfo from "../models/ItemInfo";
import TeleportationLocation from "../models/TeleportationLocation";
import { BridgerTicksID, DynamicPropertyID } from "../models/DynamicProperty";
import { getInvData, locationData, VERSION } from "./staticData";

/**
 * giveItems: clears inventory and gives item with lockmode (optional: assigned slot)
 */
const giveItems = function (player: Player, itemArr: ItemInfo[]): void {
  const container = player.getComponent("inventory").container;

  container.clearAll();

  for (const { item, quantity, slot, name = "" } of itemArr) {
    const i = new ItemStack(item, quantity);
    i.lockMode = ItemLockMode.inventory;
    if (name) i.nameTag = name;
    slot ? container.setItem(slot, i) : container.addItem(i);
  }
};

/**
 * teleportation: teleport player
 */
const teleportation = function (player: Player, loc: TeleportationLocation): void {
  player.teleport(loc.position, { facingLocation: loc.facing });
};

/**
 * confirmMessage: show message with sound
 */
const confirmMessage = function (player: Player, message: string, sound: string = ""): void {
  player.sendMessage(message);
  if (sound) player.playSound(sound);
};

const date = new Date();
const today = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${String(
  date.getFullYear()
).slice(-2)}`;

const setBridgerMode = function (game: BridgerTicksID): void {
  tempData.bridgerMode = game;
};

const getProperty = function (dynamicId: DynamicPropertyID): string {
  return world.getDynamicProperty(dynamicId).toString();
};

const setProperty = function (dynamicId: DynamicPropertyID, value: any): void {
  world.setDynamicProperty(dynamicId, value);
};

/**
 * get the distance (rounded) between 2 location vector3 (ignoring y vector)
 */
const calculateDistance = function (location1: Vector3, location2: Vector3): number {
  if (!location1 || !location2) return 0;
  const dx = location2.x - location1.x;
  const dz = location2.z - location1.z;
  return Math.round(Math.sqrt(dx * dx + dz * dz));
};

/**
 * converts from tick to seconds
 */
const tickToSec = function (ticks: number): string {
  return (ticks / 20).toFixed(2);
};

/**
 * display lobby scoreboard
 */
const lobbyScoreboardDisplay = function (player: Player): void {
  const scoreboard = `      §b§lAUTO World§r\n§7-------------------§r\n §7- §6Username:§r\n   ${player.nameTag}\n\n §7- §6Game Available:§r\n   Bridger\n   Clutcher\n\n §7- §6Discord:§r\n   .gg/4NRYhCYykk\n§7-------------------§r\n §8§oVersion ${VERSION} | ${today}`;
  player.onScreenDisplay.setTitle(scoreboard);
};

/**
 * back to lobby
 */
const backToLobbyKit = function (player: Player) {
  tempData.gameID = "lobby";
  lobbyScoreboardDisplay(player);
  confirmMessage(player, "§7Teleporting back to lobby...");
  giveItems(player, getInvData("lobby"));
  teleportation(player, <TeleportationLocation>locationData.lobby);
};

export {
  giveItems,
  teleportation,
  confirmMessage,
  today,
  setBridgerMode,
  getProperty,
  setProperty,
  calculateDistance,
  lobbyScoreboardDisplay,
  backToLobbyKit,
  tickToSec,
};
