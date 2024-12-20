import * as mc from "@minecraft/server";
import * as form from "../script/forms.js";
import { tempData, clutchStrength } from "../script/data.js";

const clutcher = {
  countDown: null,
  hitTimer: null,
  sec: 3,
  hitIndex: 0,
};

const updateClutcherSettings = async function (player, numHit) {
  const clutchForm = await form.clutchSettingsForm();
  tempData.clutch.map((power, index) => {
    clutchForm.button(
      index + 9,
      `Hit #${index + 1}: ${clutchStrength[power].name}`,
      [],
      clutchStrength[power].texture,
      1,
      false
    );
  });
  const { selection, canceled } = await clutchForm.show(player);
  const clutchSelection = selection - 9;
  const prevStrength = tempData.clutch[clutchSelection];

  tempData.clutch[clutchSelection] = prevStrength !== 3 ? prevStrength + 1 : 1;

  if (canceled) return;
  await updateClutcherSettings(player, numHit);
};

const startClutch = function (player) {
  mc.system.clearRun(clutcher.countDown);
  player.onScreenDisplay.setActionBar("§aGO!");
  clutcher.sec = 3;

  const { x: viewX, z: viewZ } = player.getViewDirection(); // CHECK
  const powerSetting = tempData.clutch;

  player.applyKnockback(-viewX, -viewZ, powerSetting[clutcher.hitIndex], 0.7);
  clutcher.hitIndex++;

  clutcher.hitTimer = mc.system.runInterval(() => {
    if (clutcher.hitIndex === tempData.clutch.length) {
      mc.system.clearRun(clutcher.hitTimer);
      clutcher.hitIndex = 0;
      return;
    }

    player.applyKnockback(-viewX, -viewZ, powerSetting[clutcher.hitIndex], 0.7);
    clutcher.hitIndex++;
  }, 13);
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

    tempData.clutch = new Array(numHit).fill(1);
    updateClutcherSettings(player, numHit);
  }

  // if (selection === 14)
  // if (selection === 16)
};
