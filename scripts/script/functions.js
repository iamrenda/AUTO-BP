import { ItemStack } from "@minecraft/server";
/**
 * giveItems: clears inventory and gives item with lockmode (optional: assigned slot)
 *
 * @param {Player} player - player object
 * @param {Array} itemArr - an array containing object of {item: String, quantity: number, slot?: number}
 */
const giveItems = function (player, itemArr) {
  const container = player.getComponent("inventory").container;

  container.clearAll();

  for (const { item, quantity, slot } of itemArr) {
    const i = new ItemStack(item, quantity);
    i.lockMode = "inventory";
    slot ? container.setItem(slot, i) : container.addItem(i);
  }
};

/**
 * teleportation: teleport player
 *
 * @param {Player} player - player object
 * @param {Object} obj - an object contain location to teleport (must have key of position and facing)
 */
const teleportation = function (player, obj) {
  player.teleport(obj.position, { facingLocation: obj.facing });
};

/**
 * confirmMessage: show message with sound
 *
 * @param {Player} player - player object
 * @param {String} message - message to send
 * @param {String} sound - minecraft sound to play (optional)
 */
const confirmMessage = function (player, message, sound = "") {
  player.sendMessage(message);
  if (sound) player.playSound(sound);
};

export { giveItems, teleportation, confirmMessage };
