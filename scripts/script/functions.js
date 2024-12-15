import * as mc from "@minecraft/server";
import * as data from "./data.js";

export const getGameId = function () {
  return mc.world.getDynamicProperty("auto:gameId");
};

export const setGameId = function (gameId) {
  const gameIds = ["lobby", "bridger", "clutcher"];

  if (gameIds.includes(gameId))
    mc.world.setDynamicProperty("auto:gameId", gameId);
  else return console.warn("[ERROR] Improper game id detected");
};

/////////////////////////////////////////////////////////////// CHECK wtf btich make some classes pussy
/**
 * getPB: gets the personal best score
 *
 * @param {String} game - must chosen from here ["straight16b", "straight25b", "straight50b", "incline16b", "incline25b", "incline50b"];
 * @returns {number} - the personal best score given in ticks (returns -1 in default)
 */
export const getPB = function (game) {
  if (!data.games.includes(game)) console.warn("[ERROR] Unknown game detected");
  const rawDataArr = mc.world.getDynamicProperty("auto:pb").split("|");
  const gameIndex = data.games.indexOf(game);

  return Number(rawDataArr[gameIndex]);
};

/**
 * setPB: sets the personal best score
 *
 * @param {String} game - must chosen from here ["straight16b", "straight25b", "straight50b", "incline16b", "incline25b", "incline50b"];
 * @param {number} ticks - the new personal best score to store
 */
export const setPB = function (game, ticks) {
  if (!data.games.includes(game)) console.warn("[ERROR] Unknown game detected");
  const rawDataArr = mc.world.getDynamicProperty("auto:pb").split("|");
  const gameIndex = data.games.indexOf(game);

  rawDataArr[gameIndex] = String(ticks);

  const newRawData = rawDataArr.join("|");
  mc.world.setDynamicProperty("auto:pb", newRawData);
};

/**
 * resetPB: resets the personal best score
 *
 * @param {String} game - must chosen from here ["straight16b", "straight25b", "straight50b", "incline16b", "incline25b", "incline50b"];
 */
export const resetPB = function (game) {
  if (!data.games.includes(game)) console.warn("[ERROR] Unknown game detected");
  const rawDataArr = mc.world.getDynamicProperty("auto:pb").split("|");
  const gameIndex = data.games.indexOf(game);

  rawDataArr[gameIndex] = -1;

  const newRawData = rawDataArr.join("|");
  mc.world.setDynamicProperty("auto:pb", newRawData);
};

// CHECK wth where did the DRY principle went?
/**
 * getAttempts: gets the bridging attempts count
 *
 * @param {String} game - must chosen from here ["straight16b", "straight25b", "straight50b", "incline16b", "incline25b", "incline50b"];
 * @returns {number} - the number of attempts that the player have done
 */
export const getAttempts = function (game) {
  if (!data.games.includes(game)) console.warn("[ERROR] Unknown game detected");
  const rawDataArr = mc.world.getDynamicProperty("auto:atmps").split("|");
  const gameIndex = data.games.indexOf(game);

  return Number(rawDataArr[gameIndex]);
};

/**
 * addAttempts: adds the bridging attempts count
 *
 * @param {String} game - must chosen from here ["straight16b", "straight25b", "straight50b", "incline16b", "incline25b", "incline50b"];
 */
export const addAttempts = function (game) {
  if (!data.games.includes(game)) console.warn("[ERROR] Unknown game detected");
  const rawDataArr = mc.world.getDynamicProperty("auto:atmps").split("|");
  const gameIndex = data.games.indexOf(game);

  rawDataArr[gameIndex] = +rawDataArr[gameIndex] + 1;

  const newRawData = rawDataArr.join("|");
  mc.world.setDynamicProperty("auto:atmps", newRawData);
};

/**
 * getSuccessAttempts: gets the successful bridging count
 *
 * @param {String} game - must chosen from here ["straight16b", "straight25b", "straight50b", "incline16b", "incline25b", "incline50b"];
 * @returns {number} - the number of successful attempts that the player have done
 */
export const getSuccessAttempts = function (game) {
  if (!data.games.includes(game)) console.warn("[ERROR] Unknown game detected");
  const rawDataArr = mc.world
    .getDynamicProperty("auto:successAtmps")
    .split("|");
  const gameIndex = data.games.indexOf(game);

  return Number(rawDataArr[gameIndex]);
};

/**
 * addSuccessAttempts: adds the successful bridging attempts count
 *
 * @param {String} game - must chosen from here ["straight16b", "straight25b", "straight50b", "incline16b", "incline25b", "incline50b"];
 */
export const addSuccessAttempts = function (game) {
  if (!data.games.includes(game)) console.warn("[ERROR] Unknown game detected");
  const rawDataArr = mc.world
    .getDynamicProperty("auto:successAtmps")
    .split("|");
  const gameIndex = data.games.indexOf(game);

  rawDataArr[gameIndex] = +rawDataArr[gameIndex] + 1;

  const newRawData = rawDataArr.join("|");
  mc.world.setDynamicProperty("auto:successAtmps", newRawData);
};

/**
 * giveItems: clears inventory and gives item with lockmode (optional: assigned slot)
 *
 * @param {Player} player - player object
 * @param {Array} itemArr - an array containing object of {item: String, quantity: number, slot?: number}
 */
export const giveItems = function (player, itemArr) {
  const container = player.getComponent("inventory").container;

  container.clearAll();

  for (const { item, quantity, slot } of itemArr) {
    const i = new mc.ItemStack(item, quantity);
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
export const teleportation = function (player, obj) {
  player.teleport(obj.position, { facingLocation: obj.facing });
};
