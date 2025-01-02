import { world, ItemLockMode, ItemStack, Player } from "@minecraft/server";
import { tempData } from "./staticData";
import ItemInfo from "models/ItemInfo";
import TeleportationLocation from "models/TeleportationLocation";
import { DynamicGame, DynamicPropertyID } from "models/DynamicProperty";

/**
 * giveItems: clears inventory and gives item with lockmode (optional: assigned slot)
 *
 * @param {Player} player - player object
 * @param {Array} itemArr - an array containing object of {item: String, quantity: number, slot?: number}
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

const setBridgerMode = function (game: DynamicGame): void {
  tempData.bridgerMode = game;
};

const getProperty = function (dynamicId: DynamicPropertyID): string {
  return world.getDynamicProperty(dynamicId).toString();
};

const setProperty = function (dynamicId: DynamicPropertyID, value: any): void {
  world.setDynamicProperty(dynamicId, value);
};

export { giveItems, teleportation, confirmMessage, today, setBridgerMode, getProperty, setProperty };
