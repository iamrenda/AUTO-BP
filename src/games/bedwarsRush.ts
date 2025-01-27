import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import TeleportationLocation from "../models/TeleportationLocation";
import { locationData } from "../data/staticData";
import { bedwarsRushForm } from "../forms/bedwarsRush";
import { bedwarsRushTs } from "../data/tempStorage";
import { BedwarsRushData } from "../data/dynamicProperty";
import { DynamicPropertyID } from "../models/DynamicProperty";
import { confirmationForm } from "../forms/utility";

const setAverageTime = function (newTime: number) {
  const prevAvgTime = BedwarsRushData.getData(DynamicPropertyID.BedwarsRush_AverageTime);
  const attempts = BedwarsRushData.getData(DynamicPropertyID.BedwarsRush_Attempts);
  const newAvgTime =
    prevAvgTime === -1 ? newTime : (prevAvgTime * attempts + newTime) / (attempts + 1);

  BedwarsRushData.setData(
    DynamicPropertyID.BedwarsRush_AverageTime,
    Math.round(newAvgTime * 100) / 100
  );
};

const resetBedwarsRusher = function () {
  bedwarsRushTs.commonData["ticks"] = 0;
  bedwarsRushTs.commonData["blocks"] = 0;
};

const resetMap = function () {
  bedwarsRushTs.stopTimer();
  bedwarsRushTs.clearBlocks();
  resetBedwarsRusher();
  util.updateFloatingText(BedwarsRushData.getBundledData("BedwarsRush"));
  util.giveItems("bedwarsRush");
  util.teleportation(<TeleportationLocation>locationData.bedwarsRush);
};

export const bedWarsRushFormHandler = async function (player: mc.Player) {
  const { selection } = await bedwarsRushForm(player);

  // reset pb
  if (selection === 11) {
    const { selection: confirmationSelection } = await confirmationForm(player, `Bedwars Rush`);
    if (confirmationSelection !== 15) return;

    BedwarsRushData.setData(DynamicPropertyID.BedwarsRush_PB, -1);
    util.confirmMessage("§aSuccess! Your personal best score has been reset!", "random.orb");
    util.updateFloatingText(BedwarsRushData.getBundledData("BedwarsRush"));
  }

  // back to lobby
  if (selection === 15) util.backToLobbyKit(player);
};

export const placingBlockEvt = function (block: mc.Block) {
  if (!bedwarsRushTs.commonData["blocks"] && !bedwarsRushTs.commonData["timer"])
    bedwarsRushTs.startTimer();

  bedwarsRushTs.commonData["blocks"]++;
  bedwarsRushTs.commonData["storedLocations"].add(block.location);
};

export const breakingBlockEvt = function (player: mc.Player) {
  mc.system.run(() => {
    const ticks = bedwarsRushTs.commonData["ticks"];

    resetMap();
    util.shootFireworks(player.location);

    player.onScreenDisplay.setTitle(`§6Time§7: §f${util.tickToSec(ticks)}§r`);

    if (util.isPB(BedwarsRushData.getData(DynamicPropertyID.BedwarsRush_PB), ticks)) {
      BedwarsRushData.setData(DynamicPropertyID.BedwarsRush_PB, ticks);
      util.showMessage(true, ticks, BedwarsRushData.getData(DynamicPropertyID.BedwarsRush_PB));
      player.playSound("random.levelup");
      player.onScreenDisplay.updateSubtitle("§dNEW RECORD!!!");
    } else
      util.showMessage(false, ticks, BedwarsRushData.getData(DynamicPropertyID.BedwarsRush_PB));

    setAverageTime(ticks);

    util.shootFireworks(player.location);

    BedwarsRushData.addData(DynamicPropertyID.BedwarsRush_Attempts);
    BedwarsRushData.addData(DynamicPropertyID.BedwarsRush_SuccessAttempts);

    util.updateFloatingText(BedwarsRushData.getBundledData("BedwarsRush"));
  });
};

export const listener = function () {
  util.displayScoreboard("bedwarsRush");

  if (bedwarsRushTs.commonData["player"].location.y < 97) {
    BedwarsRushData.addData(DynamicPropertyID.BedwarsRush_Attempts);
    resetMap();
  }
};
