import * as mc from "@minecraft/server";
import * as form from "../forms/clutcher";
import * as exp from "../utilities/utilities";
import * as data from "../utilities/staticData";
import tempData from "utilities/tempData";
const clutcher = {
    player: null,
    isListening: false,
    distance: 0,
    startLocation: null,
    endLocation: null,
    countDown: null,
    hitTimer: null,
    sec: 3,
    hitIndex: 0,
    teleportationIndex: 1,
};
const teleportToCounterClockwise = function (player) {
    const location = data.locationData.clutcher[clutcher.teleportationIndex];
    exp.teleportation(player, location);
    clutcher.teleportationIndex = clutcher.teleportationIndex === 3 ? 0 : clutcher.teleportationIndex + 1;
};
const updateKnockBackForm = async function (player, numHit) {
    const clutchForm = form.clutchSettingsForm();
    tempData.clutch.map((power, index) => {
        clutchForm.button(index + 9, `Hit #${index + 1}: ${data.clutchStrength[power].name}`, [], data.clutchStrength[power].texture, 1, false);
    });
    const { selection, canceled } = await clutchForm.show(player);
    const clutchSelection = selection - 9;
    const prevStrength = tempData.clutch[clutchSelection];
    tempData.clutch[clutchSelection] = prevStrength !== 3 ? prevStrength + 1 : 1;
    if (canceled)
        return exp.confirmMessage(player, "§aThe clutcher settings is now saved!", "random.orb");
    await updateKnockBackForm(player, numHit);
};
const resetClutcherData = function () {
    clutcher.hitTimer = null;
    clutcher.countDown = null;
    clutcher.hitIndex = 0;
    clutcher.startLocation = null;
    clutcher.endLocation = null;
    clutcher.distance = 0;
};
const restartClutch = function (player) {
    if (!clutcher.hitTimer && clutcher.countDown) {
        exp.confirmMessage(player, "§8Count down canceled", "note.guitar");
        clutcher.sec = 3;
    }
    if (clutcher.countDown)
        mc.system.clearRun(clutcher.countDown);
    if (clutcher.hitTimer)
        mc.system.clearRun(clutcher.hitTimer);
    resetClutcherData();
    teleportToCounterClockwise(player);
    exp.giveItems(player, data.getInvData("clutcher"));
};
const applyKnockback = function (player, { viewX, viewZ }, horizontalKb) {
    const verticalKb = 0.6;
    player.applyKnockback(-viewX, -viewZ, horizontalKb, verticalKb);
    player.playSound("game.player.hurt");
    clutcher.hitIndex++;
};
const startClutch = function (player) {
    mc.system.clearRun(clutcher.countDown);
    clutcher.isListening = true;
    player.onScreenDisplay.setActionBar("§aGO!");
    player.playSound("note.pling");
    clutcher.sec = 3;
    const { x: viewX, z: viewZ } = player.getViewDirection();
    const powerSetting = tempData.clutch;
    applyKnockback(player, { viewX, viewZ }, powerSetting[clutcher.hitIndex]);
    clutcher.hitTimer = mc.system.runInterval(() => {
        if (clutcher.hitIndex === tempData.clutch.length)
            return mc.system.clearRun(clutcher.hitTimer);
        applyKnockback(player, { viewX, viewZ }, powerSetting[clutcher.hitIndex]);
    }, 10);
};
const countDownDisplay = function (player) {
    player.playSound("note.hat");
    player.onScreenDisplay.setActionBar(`§6Count Down:§r §f${clutcher.sec}`);
    clutcher.sec--;
};
const readyForClutch = function (player) {
    clutcher.hitIndex = 0;
    countDownDisplay(player);
    clutcher.countDown = mc.system.runInterval(() => {
        if (!clutcher.sec)
            return startClutch(player);
        countDownDisplay(player);
    }, 20);
};
export const defineClutcher = function (player) {
    clutcher.player = player;
};
export const clutcherFormHandler = async function (player) {
    if (player.isSneaking && tempData.clutchShiftStart)
        return readyForClutch(player);
    const { selection } = await form.clutcherForm(player);
    if (selection === 10)
        readyForClutch(player);
    if (selection === 12) {
        const { selection: clutchNum } = await form.clutchNumForm(player);
        const numHit = clutchNum - 8;
        tempData.clutch = new Array(numHit).fill(1);
        updateKnockBackForm(player, numHit);
    }
    if (selection === 14) {
        const { selection: generalSelection } = await form.clutchGeneralForm(player);
        if (generalSelection === 10) {
            tempData.clutchShiftStart = !tempData.clutchShiftStart;
            exp.confirmMessage(player, `§a"Shift + Right Click" to start is now §6${tempData.clutchShiftStart ? "Enabled" : "Disabled"}§a!`, "random.orb");
        }
    }
    if (selection === 16)
        exp.backToLobbyKit(player);
};
export const placingBlockEvt = function ({ location }) {
    if (clutcher.isListening) {
        clutcher.isListening = false;
        clutcher.startLocation = location;
    }
    if (clutcher.hitTimer)
        clutcher.endLocation = location;
    mc.system.runTimeout(() => mc.world.getDimension("overworld").setBlockType(location, "auto:custom_redstoneBlock"), 60);
};
export const listener = async function () {
    if (clutcher.player.location.y <= 88)
        restartClutch(clutcher.player);
};
export const slowListener = function () {
    clutcher.distance = exp.calculateDistance(clutcher.startLocation, clutcher.endLocation);
    clutcher.player.onScreenDisplay.setTitle(`      §b§lAUTO World§r\n§7-------------------§r\n §7- §6Distance:§r\n   ${clutcher.distance} blocks\n\n §7- §6Hits:§r\n   ${clutcher.hitIndex}/${tempData.clutch.length}\n§7-------------------§r\n §8§oVersion 4 | ${exp.today}`);
};
