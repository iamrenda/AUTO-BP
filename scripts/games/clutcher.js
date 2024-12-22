import * as mc from "@minecraft/server";
import * as form from "../script/forms.js";
import dynamicProperty from "../script/dynamicProperty.js";
import * as exp from "../script/functions.js";
import * as data from "../script/data.js";

const clutcher = {
  player: null,
  direction: "Straight",

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

///////////////////////////////////////////////////////////////////
export const defineClutcher = function (player) {
  clutcher.player = player;
};

export const clutcherFormHandler = async function (player) {
  const { selection } = await form.clutcherForm(player);

  // clutch start
  if (selection === 10) {
    clutcher.hitIndex = 0;
    countDownDisplay(player);

    clutcher.countDown = mc.system.runInterval(() => {
      if (!clutcher.sec) return startClutch(player);
      countDownDisplay(player);
    }, 20);
  }

  // clutch hit settings
  if (selection === 12) {
    const { selection: clutchNum } = await form.clutchNumForm(player);
    const numHit = clutchNum - 8;

    data.tempData.clutch = new Array(numHit).fill(1);
    updateClutcherSettings(player, numHit);
  }

  // if (selection === 14)
  if (selection === 16) {
    dynamicProperty.setGameId("lobby");
    exp.giveItems(player, data.getInvData("lobby"));
    exp.teleportation(player, data.locationData.lobby);
    exp.confirmMessage(player, "§7Teleporting back to lobby...");
  }
};

export const placingBlockEvt = function (block) {
  mc.system.runTimeout(
    () => mc.world.getDimension("overworld").setBlockType(block.location, "auto:custom_redstoneBlock"),
    60
  );
};

export const listener = function () {
  if (clutcher.player.location.y <= 88) restartClutch(clutcher.player);

  clutcher.player.onScreenDisplay.setTitle(
    `      §b§lAUTO World§r\n§7-------------------§r\n §7- §6Direction:§r\n   ${clutcher.direction}\n\n §7- §6Distance:§r\n   0 blocks\n\n §7- §6Hits:§r\n   ${clutcher.hitIndex}/${data.tempData.clutch.length}\n§7-------------------§r\n §8§oVersion 4 | ${exp.today}`
  );
};

// CHECK DEBUGGING PURPOSES
mc.world.afterEvents.chatSend.subscribe(({ sender: player }) => {
  clutcher.player = player;
  player.sendMessage("player now defined");
  //////////////////////////////////////////////////
  // debug from here
});
