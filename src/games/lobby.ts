import * as form from "../forms/lobby";
import * as util from "../utilities/utilities";
import * as mc from "@minecraft/server";
import GameID from "../models/GameID";
import { generalTs, bridgerTs } from "../data/tempStorage";
import { StoredBlocksClass } from "../data/dynamicProperty";

/**
 * handling navigation for lobby
 */
const handleNavigation = (gameID: GameID) => {
  util.teleportation(gameID);
  generalTs.commonData["gameID"] = gameID;
  util.giveItems(util.getCurrentParentCategory());
  StoredBlocksClass.clearBlocks();
};

export const nagivatorFormHandler = async function (player: mc.Player) {
  const { selection } = await form.lobbyForm(player);

  // bridger
  if (selection === 11) {
    const { selection: bridgerDirSelection, canceled } = await form.formBridgerDirForm(player);

    if (canceled) return;

    bridgerTs.tempData["bridgerDistance"] = 16;
    if (bridgerDirSelection === 11) {
      bridgerTs.tempData["bridgerDirection"] = "Straight";
      handleNavigation("Bridger$Straight_16_blocks");
    } else if (bridgerDirSelection === 15) {
      bridgerTs.tempData["bridgerDirection"] = "Inclined";
      handleNavigation("Bridger$Inclined_16_blocks");
    }
  }

  // clutcher
  if (selection === 13) {
    generalTs.commonData["byPass"] = true;
    player.setGameMode(mc.GameMode.creative);
    player.setGameMode(9);
    generalTs.commonData["byPass"] = false;
    handleNavigation("Clutcher");
    util.sendMessage("§aYou are able to fly in survival mode, but this is an intended phenomenon.", "note.bell");
  }

  // wall run
  if (selection === 15) handleNavigation("Wall_Run$Ancient");

  // bedwars rush
  if (selection === 21) handleNavigation("Bedwars_Rush$Custom_Map");

  // fist reduce
  if (selection === 23) {
    const { selection: bridgerDirSelection, canceled } = await form.fistReduceModeForm(player);
    if (canceled) return;

    util.displayScoreboard("Fist_Reduce");
    if (bridgerDirSelection === 11) {
      handleNavigation("Fist_Reduce$Normal");
    } else if (bridgerDirSelection === 15) {
      handleNavigation("Fist_Reduce$LIMITLESS");
    }
  }

  // parkour
  if (selection === 31) {
    const { selection: bridgerDirSelection, canceled } = await form.parkourChapterForm(player);
    if (canceled) return;

    if (bridgerDirSelection === 11) {
      handleNavigation("Parkour$Chapter_1.1");
    } else if (bridgerDirSelection === 13) {
      handleNavigation("Parkour$Chapter_1.2");
    } else if (bridgerDirSelection === 15) {
      handleNavigation("Parkour$Chapter_1.3");
    }
  }
};

export const placingBlockEvt = function ({ location }: { location: mc.Vector3 }) {
  const i = new mc.ItemStack("minecraft:white_wool", 1);
  i.lockMode = mc.ItemLockMode.inventory;
  generalTs.commonData["player"].getComponent("inventory").container.addItem(i);
  bridgerTs.commonData["storedLocations"].add(location);

  mc.system.runTimeout(() => {
    try {
      mc.world.getDimension("overworld").setBlockType(location, "auto:custom_redstoneBlock");
      generalTs.commonData["storedLocations"].delete(location);
    } catch (e) {}
  }, 40);
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
