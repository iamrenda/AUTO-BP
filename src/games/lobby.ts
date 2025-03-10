import * as form from "../forms/lobby";
import * as util from "../utilities/utilities";
import * as mc from "@minecraft/server";
import GameID from "../models/GameID";
import { generalTs, bridgerTs } from "../data/tempStorage";
import { gameData, StoredBlocksClass } from "../data/dynamicProperty";
import { mapSelectorForm } from "../forms/utility";

// handling navigation for lobby
export const handleNavigation = (gameID: GameID) => {
  util.teleportation(gameID);
  generalTs.commonData["gameID"] = gameID;
  util.giveItems(util.getCurrentParentCategory());
  StoredBlocksClass.clearBlocks();
};

const reduceModes: Record<number, GameID> = {
  11: "Fist_Reduce$Normal",
  15: "Fist_Reduce$LIMITLESS",
};

export const nagivatorFormHandler = async function (player: mc.Player) {
  const { selection } = await form.lobbyForm(player);

  switch (selection) {
    // bridger
    case 11:
      const { selection: bridgerDirSelection, canceled: bridgerIsCanceled } = await form.formBridgerDirForm(player);

      if (bridgerIsCanceled) return;

      if (bridgerDirSelection === 11) {
        const distance = gameData.getData("BridgerStraightDistance");
        bridgerTs.tempData["bridgerDirection"] = "Straight";
        handleNavigation(`Bridger$Straight_${distance}_blocks`);
      } else if (bridgerDirSelection === 15) {
        const distance = gameData.getData("BridgerInclinedDistance");
        bridgerTs.tempData["bridgerDirection"] = "Inclined";
        handleNavigation(`Bridger$Inclined_${distance}_blocks`);
      }
      break;

    // clutcher
    case 13:
      generalTs.commonData["byPass"] = true;
      player.setGameMode(mc.GameMode.creative);
      player.setGameMode(9);
      generalTs.commonData["byPass"] = false;
      handleNavigation("Clutcher");
      util.sendMessage("§aYou are able to fly in survival mode, but this is an intended phenomenon.", "note.bell");
      break;

    // wall run
    case 15:
      return mapSelectorForm(player, "Wall_Run");

    // bedwars rush
    case 21:
      return mapSelectorForm(player, "Bedwars_Rush");

    // fist reduce
    case 23:
      const { selection: fistReduceSelection, canceled: fistReduceIsCanceled } = await form.fistReduceModeForm(player);
      if (fistReduceIsCanceled) return;

      handleNavigation(reduceModes[fistReduceSelection]);
      util.displayScoreboard("Fist_Reduce");
      break;

    // parkour
    case 29:
      return mapSelectorForm(player, "Parkour");

    // wool parkour
    case 31:
      return mapSelectorForm(player, "Wool_Parkour");
  }
};

export const launchingStickHandler = function (player: mc.Player) {
  const { x: directionX, y: directionY, z: directionZ } = player.getViewDirection();

  player.applyKnockback(directionX, directionZ, 7, 2 * (1 + directionY));
  player.playSound("breeze_wind_charge.burst", { location: player.location });
  player.spawnParticle("minecraft:huge_explosion_emitter", player.location);
};

export const creditFormHandler = function (player: mc.Player) {
  form.lobbyCreditForm(player);
};
