import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import { bedwarsRushForm } from "../forms/bedwarsRush";
import { bedwarsRushTs } from "../data/tempStorage";
import { BedwarsRushData } from "../data/dynamicProperty";

export const bedWarsRushFormHandler = async function (player: mc.Player) {
  const { selection } = await bedwarsRushForm(player);

  // reset pb
  if (selection === 11) {
    util.resetPB(player, BedwarsRushData, "Bedwars Rush", "BedwarsRush");
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
    util.onRunnerSuccess(bedwarsRushTs, BedwarsRushData, () => undefined);
  });
};

export const listener = function () {
  util.displayScoreboard("bedwarsRush");

  if (!(bedwarsRushTs.commonData["player"].location.y < 97)) return;

  // on fail
  util.onRunnerFail(BedwarsRushData);
};
