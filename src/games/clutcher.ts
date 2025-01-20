import * as mc from "@minecraft/server";
import * as form from "../forms/clutcher";
import * as util from "../utilities/utilities";
import * as data from "../data/staticData";
import { clutcherTs } from "../data/tempStorage";

/////////////////////////////////////////////////////////
/**
 * teleport player to counter clockwise location
 */
const teleportToCounterClockwise = function () {
  const location =
    data.locationData.clutcher[clutcherTs.tempData["teleportationIndex"] as keyof typeof data.locationData.clutcher];
  util.teleportation(location);
  clutcherTs.tempData["teleportationIndex"] =
    clutcherTs.tempData["teleportationIndex"] === 3 ? 0 : clutcherTs.tempData["teleportationIndex"] + 1;
};

/**
 * knockback customizer for each hit, shows until cancel
 */
const updateKnockBackForm = async function (player: mc.Player, numHit: number) {
  const clutchForm = form.clutchSettingsForm();
  clutcherTs.tempData["clutchHits"].map((power, index) => {
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
  const prevStrength = clutcherTs.tempData["clutchHits"][clutchSelection];

  clutcherTs.tempData["clutchHits"][clutchSelection] = prevStrength !== 3 ? prevStrength + 1 : 1;

  if (canceled) return util.confirmMessage("§aThe clutcher settings is now saved!", "random.orb");
  await updateKnockBackForm(player, numHit);
};

/**
 * reset clutcher data
 */
const resetClutcher = function () {
  clutcherTs.tempData["hitTimer"] = null;
  clutcherTs.tempData["countDown"] = null;
  clutcherTs.tempData["hitIndex"] = 0;

  clutcherTs.tempData["startLocation"] = null;
  clutcherTs.tempData["endLocation"] = null;
  clutcherTs.tempData["distance"] = 0;
};

/**
 * when player fails
 */
const restartClutch = function () {
  // if fail during countdown
  if (!clutcherTs.tempData["hitTimer"] && clutcherTs.tempData["countDown"]) {
    util.confirmMessage("§8Count down canceled", "note.guitar");
    clutcherTs.tempData["sec"] = 3;
  }

  if (clutcherTs.tempData["countDown"]) mc.system.clearRun(clutcherTs.tempData["countDown"]);
  if (clutcherTs.tempData["hitTimer"]) mc.system.clearRun(clutcherTs.tempData["hitTimer"]);

  resetClutcher();

  teleportToCounterClockwise();
  util.giveItems("clutcher");
};

/**
 * applying knockback to player from knockback
 */
const applyKnockback = function (
  player: mc.Player,
  { viewX, viewZ }: { viewX: number; viewZ: number },
  horizontalKb: number
) {
  const verticalKb = 0.6;

  player.applyKnockback(-viewX, -viewZ, horizontalKb, verticalKb);
  player.playSound("game.player.hurt");
  clutcherTs.tempData["hitIndex"]++;
};

/**
 * start applying knockback to the player
 */
const startClutch = function (player: mc.Player) {
  mc.system.clearRun(clutcherTs.tempData["countDown"]);
  clutcherTs.tempData["isListening"] = true;
  player.playSound("note.pling");
  clutcherTs.tempData["sec"] = 3;

  const { x: viewX, z: viewZ } = player.getViewDirection();
  const powerSetting: number[] = clutcherTs.tempData["clutchHits"];

  applyKnockback(player, { viewX, viewZ }, powerSetting[clutcherTs.tempData["hitIndex"]]);
  clutcherTs.tempData["hitTimer"] = mc.system.runInterval(() => {
    if (clutcherTs.tempData["hitIndex"] === clutcherTs.tempData["clutchHits"].length)
      return mc.system.clearRun(clutcherTs.tempData["hitTimer"]);
    applyKnockback(player, { viewX, viewZ }, powerSetting[clutcherTs.tempData["hitIndex"]]);
  }, 10);
};

/**
 * count down display
 */
const countDownDisplay = function (player: mc.Player) {
  player.playSound("note.hat");
  player.onScreenDisplay.setTitle(`§6${clutcherTs.tempData["sec"]}`);
  clutcherTs.tempData["sec"]--;
};

/**
 * start count down
 */
const readyForClutch = function (player: mc.Player) {
  clutcherTs.tempData["hitIndex"] = 0;
  countDownDisplay(player);

  clutcherTs.tempData["countDown"] = mc.system.runInterval(() => {
    if (!clutcherTs.tempData["sec"]) return startClutch(player);
    countDownDisplay(player);
  }, 20);
};

///////////////////////////////////////////////////////////////////
export const clutcherFormHandler = async function (player: mc.Player) {
  // quick start
  if (player.isSneaking && clutcherTs.tempData["clutchShiftStart"]) return readyForClutch(player);

  const { selection } = await form.clutcherForm(player);

  // clutch start
  if (selection === 10) readyForClutch(player);

  // clutch settings
  if (selection === 12) {
    const { selection: clutchNum } = await form.clutchNumForm(player);
    const numHit = clutchNum - 8;

    clutcherTs.tempData["clutchHits"] = new Array(numHit).fill(1);
    updateKnockBackForm(player, numHit);
  }

  // general settings
  if (selection === 14) {
    const { selection: generalSelection } = await form.clutchGeneralForm(player);

    if (generalSelection === 10) {
      clutcherTs.tempData["clutchShiftStart"] = !clutcherTs.tempData["clutchShiftStart"];
      util.confirmMessage(
        `§a"Shift + Right Click" to start is now §6${
          clutcherTs.tempData["clutchShiftStart"] ? "Enabled" : "Disabled"
        }§a!`,
        "random.orb"
      );
    }
  }

  // quit
  if (selection === 16) {
    clutcherTs.clearBlocks();
    util.backToLobbyKit(player);
  }
};

export const placingBlockEvt = function ({ location }: { location: mc.Vector3 }) {
  if (clutcherTs.tempData["isListening"]) {
    clutcherTs.tempData["isListening"] = false;
    clutcherTs.tempData["startLocation"] = location;
  }

  if (clutcherTs.tempData["hitTimer"]) clutcherTs.tempData["endLocation"] = location;

  clutcherTs.commonData["storedLocations"].add(location);
  mc.system.runTimeout(() => {
    try {
      mc.world.getDimension("overworld").setBlockType(location, "auto:custom_redstoneBlock");
      clutcherTs.commonData["storedLocations"].delete(location);
    } catch (e) {}
  }, 60);
};

export const listener = function () {
  if (clutcherTs.commonData["player"].location.y <= 88) restartClutch();
};

export const slowListener = function () {
  clutcherTs.tempData["distance"] = util.calculateDistance(
    clutcherTs.tempData["startLocation"],
    clutcherTs.tempData["endLocation"]
  );
  util.displayScoreboard("clutcher");
};
