import * as mc from "@minecraft/server";
import * as form from "../script/forms.js";
import dynamicProperty from "../script/dynamicProperty.js";
import * as exp from "../script/functions.js";
import * as data from "../script/staticData.js";

const clutcher = {
  player: null,
  startLocation: null,
  endLocation: null,

  listening: false, // listening for the first block placement

  countDown: null, // countdown before knockbacks
  hitTimer: null, // interval between hits
  sec: 3, // countdown seconds
  hitIndex: 0, // hit count
};

const updateClutcherSettings = async function (player, numHit) {
  const clutchForm = await form.clutchSettingsForm();
  data.tempData.clutch.map((power, index) => {
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
  const prevStrength = data.tempData.clutch[clutchSelection];

  data.tempData.clutch[clutchSelection] = prevStrength !== 3 ? prevStrength + 1 : 1;

  if (canceled) return exp.confirmMessage(player, "§aThe clutcher settings is now saved!", "random.orb");
  await updateClutcherSettings(player, numHit);
};

const restartClutch = function (player) {
  if (!clutcher.hitTimer && clutcher.countDown) {
    exp.confirmMessage(player, "§8Count down canceled", "note.guitar");
    clutcher.sec = 3;
  }
  if (clutcher.countDown) mc.system.clearRun(clutcher.countDown);
  if (clutcher.hitTimer) mc.system.clearRun(clutcher.hitTimer);

  clutcher.hitTimer = null;
  clutcher.countDown = null;
  clutcher.startLocation = null;
  clutcher.endLocation = null;
  clutcher.hitIndex = 0;

  exp.teleportation(player, data.locationData.clutcher);
  exp.giveItems(player, data.getInvData("clutcher"));
};

const applyKnockback = function (player, { viewX, viewZ }, powerSetting) {
  player.applyKnockback(-viewX, -viewZ, powerSetting[clutcher.hitIndex], 0.6);
  player.playSound("game.player.hurt");
  clutcher.hitIndex++;
};

const startClutch = function (player) {
  mc.system.clearRun(clutcher.countDown);
  player.onScreenDisplay.setActionBar("§aGO!");
  player.playSound("note.pling");
  clutcher.sec = 3;
  clutcher.listening = true;

  const { x: viewX, z: viewZ } = player.getViewDirection();
  const powerSetting = data.tempData.clutch;

  applyKnockback(player, { viewX, viewZ }, powerSetting);
  clutcher.hitTimer = mc.system.runInterval(() => {
    if (clutcher.hitIndex === data.tempData.clutch.length) return mc.system.clearRun(clutcher.hitTimer);
    applyKnockback(player, { viewX, viewZ }, powerSetting);
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
    if (!clutcher.sec) return startClutch(player);
    countDownDisplay(player);
  }, 20);
};

function calculateDistance(location1, location2) {
  let dx = location2.x - location1.x;
  let dy = location2.y - location1.y;
  let dz = location2.z - location1.z;
  return Math.sqrt(dx * dx, dy * dy, dz * dz);
}

///////////////////////////////////////////////////////////////////
export const defineClutcher = function (player) {
  clutcher.player = player;
};

export const clutcherFormHandler = async function (player) {
  // quick start
  if (player.isSneaking && data.tempData.clutchShiftStart) return readyForClutch(player);

  const { selection } = await form.clutcherForm(player);

  // clutch start
  if (selection === 10) readyForClutch(player);

  // clutch settings
  if (selection === 12) {
    const { selection: clutchNum } = await form.clutchNumForm(player);
    const numHit = clutchNum - 8;

    data.tempData.clutch = new Array(numHit).fill(1);
    updateClutcherSettings(player, numHit);
  }

  // general settings
  if (selection === 14) {
    const { selection: generalSelection } = await form.clutchGeneralForm(player);

    if (generalSelection === 10) {
      data.tempData.clutchShiftStart = !data.tempData.clutchShiftStart;
      exp.confirmMessage(
        player,
        `§a"Shift + Right Click" to start is now §6${data.tempData.clutchShiftStart ? "Enabled" : "Disabled"}§a!`,
        "random.orb"
      );
    }
  }

  // quit
  if (selection === 16) {
    dynamicProperty.setGameId("lobby");
    exp.giveItems(player, data.getInvData("lobby"));
    exp.teleportation(player, data.locationData.lobby);
    exp.confirmMessage(player, "§7Teleporting back to lobby...");
  }
};

export const placingBlockEvt = function (block) {
  if (clutcher.listening) {
    clutcher.startLocation = block.location;
    clutcher.listening = false;
  }

  clutcher.endLocation = block.location;

  mc.system.runTimeout(
    () => mc.world.getDimension("overworld").setBlockType(block.location, "auto:custom_redstoneBlock"),
    60
  );
};

export const listener = async function () {
  const player = clutcher.player;

  if (player.location.y <= 88) restartClutch(player);

  if (player.isFlying) {
    player.setGameMode("survival");
    await player.setGameMode("creative");
    player.setGameMode(7);
  }
};

export const slowListener = function () {
  const distance = calculateDistance(
    clutcher.startLocation ?? { x: 0, y: 0, z: 0 },
    clutcher.endLocation ?? { x: 0, y: 0, z: 0 }
  );
  clutcher.player.onScreenDisplay.setTitle(
    `      §b§lAUTO World§r\n§7-------------------§r\n §7- §6Distance:§r\n   ${distance} blocks\n\n §7- §6Hits:§r\n   ${clutcher.hitIndex}/${data.tempData.clutch.length}\n§7-------------------§r\n §8§oVersion 4 | ${exp.today}`
  );
};

// CHECK DEBUGGING PURPOSES
mc.world.afterEvents.chatSend.subscribe(({ sender: player }) => {
  clutcher.player = player;
  player.sendMessage("player now defined");
  //////////////////////////////////////////////////
  // debug from here
  player.sendMessage(
    `x: ${clutcher.startLocation?.x}, y: ${clutcher.startLocation?.y}, z: ${clutcher.startLocation?.y}`
  );
  player.sendMessage(`x: ${clutcher.endLocation?.x}, y: ${clutcher.endLocation?.y}, z: ${clutcher.endLocation?.y}`);
});
