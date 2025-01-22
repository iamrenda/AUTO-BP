import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import TeleportationLocation from "../models/TeleportationLocation";
import { locationData } from "../data/staticData";
import { bedwarsRushForm } from "../forms/bedwarsRush";
import { bedwarsRushTs } from "../data/tempStorage";
import { BedwarsRushData } from "../data/dynamicProperty";

const resetBedwarsRusher = function () {
  bedwarsRushTs.commonData["ticks"] = 0;
  bedwarsRushTs.commonData["blocks"] = 0;
};

const resetMap = function () {
  bedwarsRushTs.stopTimer();
  bedwarsRushTs.clearBlocks();
  resetBedwarsRusher();
  util.updateFloatingText(BedwarsRushData.getBundledData());
  util.giveItems("bedwarsRush");
  util.teleportation(<TeleportationLocation>locationData.bedwarsRush);
};

export const bedWarsRushFormHandler = async function (player: mc.Player) {
  const { selection } = await bedwarsRushForm(player);

  // back to lobby
  if (selection === 16) util.backToLobbyKit(player);
};

export const placingBlockEvt = function (block: mc.Block) {
  if (!bedwarsRushTs.commonData["blocks"] && !bedwarsRushTs.commonData["timer"])
    bedwarsRushTs.startTimer();

  bedwarsRushTs.commonData["blocks"]++;
  bedwarsRushTs.commonData["storedLocations"].add(block.location);
};

export const breakingBlockEvt = function (player: mc.Player) {
  mc.system.run(() => {
    resetMap();
    util.shootFireworks(player.location);
  });
};

export const listener = function () {
  util.displayScoreboard("bedwarsRush");

  if (bedwarsRushTs.commonData["player"].location.y < 97) {
    resetMap();
  }
};
