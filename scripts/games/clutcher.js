import * as mc from "@minecraft/server";
import * as form from "../script/forms.js";
import { tempData } from "../script/data.js";

const clutcher = {
  countDown: undefined,
  hitTimer: undefined,
  sec: 3,
  hit: 0,
};

const updateClutcherSettings = async function (player) {
  const { selection, canceled } = await form.clutchSettingsForm(player);
  if (selection === 22 || canceled) return;

  const clutchSelection = selection - 9;
  const prevStrength = tempData.clutch[clutchSelection];
  tempData.clutch[clutchSelection] = prevStrength !== 3 ? prevStrength + 1 : 0;
  await updateClutcherSettings(player);
};

const startClutch = function (player) {
  mc.system.clearRun(clutcher.countDown);
  clutcher.sec = 3;

  const { x: viewX, z: viewZ } = player.getHeadLocation(); // CHECK
  clutcher.hitTimer = mc.system.runInterval(() => {
    player.applyKnockback(-viewX, -viewZ, 2, power);
  }, 15);
};

export const clutcherFormHandler = async function (player) {
  const { selection } = await form.clutcherForm(player);

  if (selection === 10) {
    if (clutcher.sec) player.onScreenDisplay.setActionBar(`Count Down: ${clutcher.sec}`);
    clutcher.countDown = mc.system.runInterval(() => {
      clutcher.sec--;
      if (clutcher.sec) player.onScreenDisplay.setActionBar(`Count Down: ${clutcher.sec}`);
      else startClutch(player);
    }, 20);
  }

  if (selection === 12) await updateClutcherSettings(player); // clutch settings
  // if (selection === 14)
  // if (selection === 16)
};
