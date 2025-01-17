import * as mc from "@minecraft/server";
import * as form from "../forms/clutcher";
import * as util from "../utilities/utilities";
import * as data from "../utilities/staticData";
import ts from "../utilities/tempStorage";

type Clutcher = {
  isListening: boolean;
  distance: number;
  startLocation: mc.Vector3;
  endLocation: mc.Vector3;

  storedLocations: Set<mc.Vector3>;

  countDown?: number;
  hitTimer?: number;
  sec: number;
  hitIndex: number;

  teleportationIndex: number;
};

const clutcher: Clutcher = {
  isListening: false, // weather listening for the first block detection
  distance: 0,
  startLocation: null,
  endLocation: null,

  storedLocations: new Set(),

  countDown: null, // countdown before knockbacks
  hitTimer: null, // interval between hits
  sec: 3, // countdown seconds
  hitIndex: 0, // hit count

  teleportationIndex: 1,
};

/////////////////////////////////////////////////////////
/**
 * teleport player to counter clockwise location
 */
const teleportToCounterClockwise = function () {
  const location = data.locationData.clutcher[clutcher.teleportationIndex];
  util.teleportation(location);
  clutcher.teleportationIndex = clutcher.teleportationIndex === 3 ? 0 : clutcher.teleportationIndex + 1;
};

/**
 * knockback customizer for each hit, shows until cancel
 */
const updateKnockBackForm = async function (player: mc.Player, numHit: number) {
  const clutchForm = form.clutchSettingsForm();
  ts.getData("clutchHits").map((power, index) => {
    clutchForm.button(
      index + 9,
      `Hit #${index + 1}: ${data.clutchStrength[power].name}`,
      [],
      data.clutchStrength[power].texture,
      1,
      false
    );
  });
  const { selection, canceled } = await clutchForm.show(player);
  const clutchSelection = selection - 9;
  const prevStrength = ts.getData("clutchHits")[clutchSelection];

  ts.getData("clutchHits")[clutchSelection] = prevStrength !== 3 ? prevStrength + 1 : 1;

  if (canceled) return util.confirmMessage("§aThe clutcher settings is now saved!", "random.orb");
  await updateKnockBackForm(player, numHit);
};

/**
 * reset clutcher data
 */
const resetClutcher = function () {
  clutcher.hitTimer = null;
  clutcher.countDown = null;
  clutcher.hitIndex = 0;

  clutcher.startLocation = null;
  clutcher.endLocation = null;
  clutcher.distance = 0;
};

/**
 * when player fails
 */
const restartClutch = function () {
  // if fail during countdown
  if (!clutcher.hitTimer && clutcher.countDown) {
    util.confirmMessage("§8Count down canceled", "note.guitar");
    clutcher.sec = 3;
  }

  if (clutcher.countDown) mc.system.clearRun(clutcher.countDown);
  if (clutcher.hitTimer) mc.system.clearRun(clutcher.hitTimer);

  resetClutcher();

  teleportToCounterClockwise();
  util.giveItems("clutcher");
};

/**
 * applying knockback to player from knockback
 */
const applyKnockback = function (player: mc.Player, { viewX, viewZ }, horizontalKb: number) {
  const verticalKb = 0.6;

  player.applyKnockback(-viewX, -viewZ, horizontalKb, verticalKb);
  player.playSound("game.player.hurt");
  clutcher.hitIndex++;
};

/**
 * start applying knockback to the player
 */
const startClutch = function (player: mc.Player) {
  mc.system.clearRun(clutcher.countDown);
  clutcher.isListening = true;
  player.onScreenDisplay.setTitle("§aGO!");
  player.playSound("note.pling");
  clutcher.sec = 3;

  const { x: viewX, z: viewZ } = player.getViewDirection();
  const powerSetting: number[] = ts.getData("clutchHits");

  applyKnockback(player, { viewX, viewZ }, powerSetting[clutcher.hitIndex]);
  clutcher.hitTimer = mc.system.runInterval(() => {
    if (clutcher.hitIndex === ts.getData("clutchHits").length) return mc.system.clearRun(clutcher.hitTimer);
    applyKnockback(player, { viewX, viewZ }, powerSetting[clutcher.hitIndex]);
  }, 10);
};

/**
 * count down display
 */
const countDownDisplay = function (player: mc.Player) {
  player.playSound("note.hat");
  player.onScreenDisplay.setTitle(`§6${clutcher.sec}`);
  clutcher.sec--;
};

/**
 * start count down
 */
const readyForClutch = function (player: mc.Player) {
  clutcher.hitIndex = 0;
  countDownDisplay(player);

  clutcher.countDown = mc.system.runInterval(() => {
    if (!clutcher.sec) return startClutch(player);
    countDownDisplay(player);
  }, 20);
};

const clearBlocks = function () {
  if (clutcher.storedLocations.size)
    [...clutcher.storedLocations].map((location) =>
      mc.world.getDimension("overworld").setBlockType(location, "minecraft:air")
    );
  util.backToLobbyKit();
};
///////////////////////////////////////////////////////////////////
export const clutcherFormHandler = async function (player: mc.Player) {
  // quick start
  if (player.isSneaking && ts.getData("clutchShiftStart")) return readyForClutch(player);

  const { selection } = await form.clutcherForm(player);

  // clutch start
  if (selection === 10) readyForClutch(player);

  // clutch settings
  if (selection === 12) {
    const { selection: clutchNum } = await form.clutchNumForm(player);
    const numHit = clutchNum - 8;

    ts.setData("clutchHits", new Array(numHit).fill(1));
    updateKnockBackForm(player, numHit);
  }

  // general settings
  if (selection === 14) {
    const { selection: generalSelection } = await form.clutchGeneralForm(player);

    if (generalSelection === 10) {
      ts.setData("clutchShiftStart", !ts.getData("clutchShiftStart"));
      util.confirmMessage(
        `§a"Shift + Right Click" to start is now §6${ts.getData("clutchShiftStart") ? "Enabled" : "Disabled"}§a!`,
        "random.orb"
      );
    }
  }

  // quit
  if (selection === 16) clearBlocks();
};

export const placingBlockEvt = function ({ location }) {
  if (clutcher.isListening) {
    clutcher.isListening = false;
    clutcher.startLocation = location;
  }

  if (clutcher.hitTimer) clutcher.endLocation = location;

  clutcher.storedLocations.add(location);
  mc.system.runTimeout(() => {
    try {
      mc.world.getDimension("overworld").setBlockType(location, "auto:custom_redstoneBlock");
      clutcher.storedLocations.delete(location);
    } catch (e) {}
  }, 60);
};

export const listener = async function () {
  if (ts.getData("player").location.y <= 88) restartClutch();
};

export const slowListener = function () {
  clutcher.distance = util.calculateDistance(clutcher.startLocation, clutcher.endLocation);
  ts.getData("player").onScreenDisplay.setActionBar(
    `      §b§lAUTO World§r\n§7-------------------§r\n §7- §6Distance:§r\n   ${
      clutcher.distance
    } blocks\n\n §7- §6Hits:§r\n   ${clutcher.hitIndex}/${
      ts.getData("clutchHits").length
    }\n§7-------------------§r\n §8§oVersion ${data.VERSION} | ${util.today}`
  );
};

export const leaveWorldEnt = clearBlocks;
