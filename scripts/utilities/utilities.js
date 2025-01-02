import { ItemLockMode, ItemStack } from "@minecraft/server";
import { tempData } from "./staticData";
/**
 * giveItems: clears inventory and gives item with lockmode (optional: assigned slot)
 *
 * @param {Player} player - player object
 * @param {Array} itemArr - an array containing object of {item: String, quantity: number, slot?: number}
 */
const giveItems = function (player, itemArr) {
    const container = player.getComponent("inventory").container;
    container.clearAll();
    for (const { item, quantity, slot, name = "" } of itemArr) {
        const i = new ItemStack(item, quantity);
        i.lockMode = ItemLockMode.inventory;
        if (name)
            i.nameTag = name;
        slot ? container.setItem(slot, i) : container.addItem(i);
    }
};
/**
 * teleportation: teleport player
 */
const teleportation = function (player, loc) {
    player.teleport(loc.position, { facingLocation: loc.facing });
};
/**
 * confirmMessage: show message with sound
 */
const confirmMessage = function (player, message, sound = "") {
    player.sendMessage(message);
    if (sound)
        player.playSound(sound);
};
const date = new Date();
const today = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${String(date.getFullYear()).slice(-2)}`;
const setBridgerMode = function (game) {
    tempData.bridgerMode = game;
};
export { giveItems, teleportation, confirmMessage, today, setBridgerMode };
