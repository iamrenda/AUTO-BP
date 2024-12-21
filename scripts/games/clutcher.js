import * as mc from "@minecraft/server";
import * as form from "../script/forms.js";
import dynamicProperty from "../script/dynamicProperty.js";
import * as exp from "../script/functions.js";
import * as data from "../script/data.js";

const clutcher = {
  player: null,
  blocks: 0,

  countDown: null, // countdown before knockbacks
  hitTimer: null, // interval between hits
  sec: 3, // countdown seconds
  hitIndex: 0, // hit count

  toCountBlock: false, // whether placing blocks should be counted as in scoreboard
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

  if (canceled) return;
  await updateClutcherSettings(player, numHit);
};

const restartClutch = function (player) {
  if (clutcher.hitTimer) mc.system.clearRun(clutcher.hitTimer);
  clutcher.blocks = 0;
  clutcher.hitIndex = 0;
  exp.teleportation(player, data.locationData.clutcher);
  exp.giveItems(player, data.getInvData("clutcher"));
};

const startClutch = function (player) {
  mc.system.clearRun(clutcher.countDown);
  clutcher.toCountBlock = true;
  player.onScreenDisplay.setActionBar("§aGO!");
  clutcher.sec = 3;

  const { x: viewX, z: viewZ } = player.getViewDirection();
  const powerSetting = data.tempData.clutch;

  player.applyKnockback(-viewX, -viewZ, powerSetting[clutcher.hitIndex], 0.7);
  clutcher.hitIndex++;

  clutcher.hitTimer = mc.system.runInterval(() => {
    if (clutcher.hitIndex === data.tempData.clutch.length) return mc.system.clearRun(clutcher.hitTimer);

    player.applyKnockback(-viewX, -viewZ, powerSetting[clutcher.hitIndex], 0.7);
    clutcher.hitIndex++;
  }, 12);
};

///////////////////////////////////////////////////////////////////
export const defineClutcher = function (player) {
  clutcher.player = player;
};

export const clutcherFormHandler = async function (player) {
  const { selection } = await form.clutcherForm(player);

  // clutch start
  if (selection === 10) {
    if (clutcher.sec) player.onScreenDisplay.setActionBar(`Count Down: ${clutcher.sec}`);
    clutcher.countDown = mc.system.runInterval(() => {
      clutcher.sec--;
      if (clutcher.sec) player.onScreenDisplay.setActionBar(`Count Down: ${clutcher.sec}`);
      else startClutch(player);
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

export const placingBlockEvt = function () {
  if (!clutcher.toCountBlock) return;
  clutcher.blocks++;
};

export const listener = function () {
  const game = dynamicProperty.getGameId();

  if (clutcher.player.location.y <= 88) restartClutch(clutcher.player);

  clutcher.player.onScreenDisplay.setTitle(
    `      §b§lAUTO World§r\n§7-------------------§r\n §7- §6Distance:§r\n   0 blocks\n\n §7- §6Hits:§r\n   ${clutcher.hitIndex}/${data.tempData.clutch.length}\n\n §7- §6Blocks:§r\n   ${clutcher.blocks}\n§7-------------------§r\n §8§oVersion 4 | ${exp.today}`
  );
};

// CHECK DEBUGGING PURPOSES
mc.world.afterEvents.chatSend.subscribe(({ sender: player }) => {
  clutcher.player = player;
  player.sendMessage("player now defined");
  //////////////////////////////////////////////////
  // debug from here
});
