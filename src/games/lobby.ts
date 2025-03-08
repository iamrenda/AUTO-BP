import * as form from "../forms/lobby";
import * as util from "../utilities/utilities";
import * as mc from "@minecraft/server";
import GameID from "../models/GameID";
import { generalTs, bridgerTs } from "../data/tempStorage";
import { gameData, StoredBlocksClass } from "../data/dynamicProperty";

// handling navigation for lobby
const handleNavigation = (gameID: GameID) => {
  util.teleportation(gameID);
  generalTs.commonData["gameID"] = gameID;
  util.giveItems(util.getCurrentParentCategory());
  StoredBlocksClass.clearBlocks();
};

// handling wool parkour
const woolParkours: Record<number, GameID> = {
  11: "Wool_Parkour$Oak_1",
  13: "Wool_Parkour$Oak_2",
  15: "Wool_Parkour$Oak_3",
  20: "Wool_Parkour$Prismarine_1",
  22: "Wool_Parkour$Prismarine_2",
  24: "Wool_Parkour$Prismarine_3",
};

const parkours: Record<number, GameID> = {
  11: "Parkour$Chapter_1.1",
  13: "Parkour$Chapter_1.2",
  15: "Parkour$Chapter_1.3",
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
      handleNavigation("Wall_Run$Ancient");
      break;

    // bedwars rush
    case 21:
      handleNavigation("Bedwars_Rush$Custom_Map");
      break;

    // fist reduce
    case 23:
      const { selection: fistReduceSelection, canceled: fistReduceIsCanceled } = await form.fistReduceModeForm(player);
      if (fistReduceIsCanceled) return;

      util.displayScoreboard("Fist_Reduce");
      handleNavigation(reduceModes[fistReduceSelection]);
      break;

    // parkour
    case 29:
      const { selection: parkourMapSelection, canceled: parkourIsCanceled } = await form.parkourChapterForm(player);
      if (parkourIsCanceled) return;

      handleNavigation(parkours[parkourMapSelection]);
      break;

    // wool parkour
    case 31:
      const { selection: woolParkourSelection, canceled: woolParkourIsCanceled } = await form.woolParkourSelectorForm(
        player
      );
      if (woolParkourIsCanceled) return;

      handleNavigation(woolParkours[woolParkourSelection]);
      break;
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
