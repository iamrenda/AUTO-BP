import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import { locationData } from "../data/staticData";
import { bedwarsRushForm } from "../forms/bedwarsRush";
import { bedwarsRushTs } from "../data/tempStorage";
import { BedwarsRushData } from "../data/dynamicProperty";
import { DynamicPropertyID } from "../models/DynamicProperty";
import { confirmationForm } from "../forms/utility";

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
  if (selection === 15) util.backToLobbyKit(player, bedwarsRushTs);
};

export const placingBlockEvt = function (block: mc.Block) {
  if (!bedwarsRushTs.commonData["blocks"]) bedwarsRushTs.startTimer();

  bedwarsRushTs.commonData["blocks"]++;
  bedwarsRushTs.commonData["storedLocations"].add(block.location);
};

export const breakingBlockEvt = function (player: mc.Player) {
  mc.system.run(() => {
    player.setGameMode(mc.GameMode.spectator);
    util.resetMap(bedwarsRushTs, BedwarsRushData, () => undefined);
  });
};

export const listener = function () {
  util.displayScoreboard("bedwarsRush");

  if (!(bedwarsRushTs.commonData["player"].location.y < 97)) return;
  bedwarsRushTs.stopTimer();
  bedwarsRushTs.clearBlocks();
  bedwarsRushTs.commonData["blocks"] = 0;
  BedwarsRushData.addData(DynamicPropertyID.BedwarsRush_Attempts);
  util.updateFloatingText(BedwarsRushData.getBundledData("BedwarsRush"));
  util.giveItems("bedwarsRush");
  util.teleportation(locationData.bedwarsRush);
};
