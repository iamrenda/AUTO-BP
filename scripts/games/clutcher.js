import * as mc from "@minecraft/server";
import * as form from "../script/forms.js";
import dynamicProperty from "../script/dynamicProperty.js";
import * as exp from "../script/functions.js";
import * as data from "../script/data.js";

const clutcher = {
  countDown: null,
  hitTimer: null,
  sec: 3,
  hitIndex: 0,
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

const startClutch = function (player) {
  mc.system.clearRun(clutcher.countDown);
  player.onScreenDisplay.setActionBar("§aGO!");
  clutcher.sec = 3;

  const { x: viewX, z: viewZ } = player.getViewDirection(); // CHECK
  const powerSetting = data.tempData.clutch;

  player.applyKnockback(-viewX, -viewZ, powerSetting[clutcher.hitIndex], 0.7);
  clutcher.hitIndex++;

  clutcher.hitTimer = mc.system.runInterval(() => {
    if (clutcher.hitIndex === data.tempData.clutch.length) {
      mc.system.clearRun(clutcher.hitTimer);
      clutcher.hitIndex = 0;
      return;
    }

    player.applyKnockback(-viewX, -viewZ, powerSetting[clutcher.hitIndex], 0.7);
    clutcher.hitIndex++;
  }, 9);
};

///////////////////////////////////////////////////////////////////
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

export const listener = function () {
  const game = dynamicProperty.getGameId();

  if (bridger.player.location.y <= 88) {
    if (bridger.plateDisabled) enablePlate(true);
    else {
      if (bridger.timer) {
        mc.system.clearRun(bridger.timer);
        bridger.timer = null; // disabling temp
      }
      dynamicProperty.addAttempts(game);
      resetMap();
    }
  }

  // bridger.player.onScreenDisplay.setTitle(
  //   `      §b§lAUTO World§r\n§7-------------------§r\n §7- §6Personal Best:§r\n   ${
  //     dynamicProperty.getPB(game) === -1 ? "--.--" : tickToSec(dynamicProperty.getPB(game))
  //   }\n\n §7- §6Time:§r\n   ${tickToSec(bridger.ticks)}\n\n §7- §6Blocks:§r\n   ${
  //     bridger.blocks
  //   }\n§7-------------------§r\n §8§oVersion 4 | ${today}`
  // );
};
