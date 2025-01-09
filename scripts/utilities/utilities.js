import { world, ItemLockMode, ItemStack } from "@minecraft/server";
import tempData from "./tempData";
import { getInvData, locationData } from "./staticData";
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
const teleportation = function (player, loc) {
    player.teleport(loc.position, { facingLocation: loc.facing });
};
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
const getProperty = function (dynamicId) {
    return world.getDynamicProperty(dynamicId).toString();
};
const setProperty = function (dynamicId, value) {
    world.setDynamicProperty(dynamicId, value);
};
const calculateDistance = function (location1, location2) {
    if (!location1 || !location2)
        return 0;
    const dx = location2.x - location1.x;
    const dz = location2.z - location1.z;
    return Math.round(Math.sqrt(dx * dx + dz * dz));
};
const lobbyScoreboardDisplay = function (player) {
    const scoreboard = `      §b§lAUTO World§r\n§7-------------------§r\n §7- §6Username:§r\n   ${player.nameTag}\n\n §7- §6Game Available:§r\n   Bridger\n   Clutcher\n\n §7- §6Discord:§r\n   .gg/4NRYhCYykk\n§7-------------------§r\n §8§oVersion 4 | ${today}`;
    player.onScreenDisplay.setTitle(scoreboard);
};
const backToLobbyKit = function (player) {
    tempData.gameID = "lobby";
    lobbyScoreboardDisplay(player);
    confirmMessage(player, "§7Teleporting back to lobby...");
    giveItems(player, getInvData("lobby"));
    teleportation(player, locationData.lobby);
};
export { giveItems, teleportation, confirmMessage, today, setBridgerMode, getProperty, setProperty, calculateDistance, lobbyScoreboardDisplay, backToLobbyKit, };
