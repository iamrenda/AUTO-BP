import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import { parkourForm } from "../forms/parkour";
import { parkourTs } from "../data/tempStorage";
import { ParkourData } from "../data/dynamicProperty";
import { DynamicPropertyID, ParkourChapterID } from "../models/DynamicProperty";
import { locationData } from "../data/staticData";
import TeleportationLocation from "../models/TeleportationLocation";
import minecraftID from "../models/minecraftID";

type ExcludedBlocks = Record<ParkourChapterID, Set<minecraftID.MinecraftBlockIdIF>>;

const dimension = mc.world.getDimension("overworld");

const excludedBlocks: ExcludedBlocks = {
  [ParkourChapterID.chapter1_1]: new Set([
    "minecraft:air",
    "minecraft:polished_blackstone_pressure_plate",
    "minecraft:light_weighted_pressure_plate",
    "minecraft:verdant_froglight",
    "minecraft:slime",
  ]),
  [ParkourChapterID.chapter1_2]: new Set([
    "minecraft:air",
    "minecraft:polished_blackstone_pressure_plate",
    "minecraft:light_weighted_pressure_plate",
    "minecraft:ochre_froglight",
  ]),
  [ParkourChapterID.chapter1_3]: new Set([
    "minecraft:air",
    "minecraft:polished_blackstone_pressure_plate",
    "minecraft:light_weighted_pressure_plate",
    "minecraft:pearlescent_froglight",
    "minecraft:slime",
  ]),
};

/**
 * disables the plate if not disabled; returns true or false depending on availiability
 */
const isPlateDisabled = function (plate: "start" | "end"): boolean {
  if (parkourTs.tempData["isPlateDisabled"][plate]) return true;
  parkourTs.tempData["isPlateDisabled"][plate] = true;
  return false;
};

const setAverageTime = function (newTime: number) {
  const prevAvgTime = ParkourData.getData(DynamicPropertyID.Parkour_AverageTime);
  const attempts = ParkourData.getData(DynamicPropertyID.Parkour_Attempts);
  const newAvgTime = prevAvgTime === -1 ? newTime : (prevAvgTime * attempts + newTime) / (attempts + 1);

  ParkourData.setData(DynamicPropertyID.Parkour_AverageTime, Math.round(newAvgTime * 100) / 100);
};

/**
 * re-enable pressure plate (disabled temp when plate is pressed)
 */
const enablePlate = function (): void {
  parkourTs.tempData["isPlateDisabled"].start = false;
  parkourTs.tempData["isPlateDisabled"].end = false;
};

export const parkourFormHandler = async function (player: mc.Player) {
  const { selection } = await parkourForm(player);

  // back to lobby
  if (selection === 13) {
    util.backToLobbyKit(player, parkourTs);
  }
};

export const pressurePlatePushEvt = function (block: mc.Block) {
  const player = parkourTs.commonData["player"];

  switch (block.typeId) {
    // start
    case "minecraft:polished_blackstone_pressure_plate":
      if (isPlateDisabled("start")) return;
      player.playSound("note.pling");
      ParkourData.addData(DynamicPropertyID.Parkour_Attempts);
      parkourTs.startTimer();
      break;

    // end
    case "minecraft:light_weighted_pressure_plate":
      if (isPlateDisabled("end")) return;
      parkourTs.stopTimer();
      ParkourData.addData(DynamicPropertyID.Parkour_SuccessAttempts);

      const ticks = parkourTs.commonData["ticks"];

      if (util.isPB(ParkourData.getData(DynamicPropertyID.Parkour_PB), ticks)) {
        ParkourData.setData(DynamicPropertyID.Parkour_PB, ticks);
        util.showMessage(true, ticks, ParkourData.getData(DynamicPropertyID.Parkour_PB));
        player.playSound("random.levelup");
        util.showTitleBar(player, `§6Time§7: §f${util.tickToSec(ticks)}§r`, { subtitle: "§dNEW RECORD!!!" });
      } else {
        util.showTitleBar(player, `§6Time§7: §f${util.tickToSec(ticks)}§r`);
        util.showMessage(false, ticks, ParkourData.getData(DynamicPropertyID.Parkour_PB));
      }

      setAverageTime(ticks);
      parkourTs.tempData["autoReq"] = mc.system.runTimeout(() => {
        enablePlate();
        parkourTs.tempData["autoReq"] = undefined;
        util.teleportation(<TeleportationLocation>locationData[parkourTs.commonData["gameID"]]);
      }, 80);

      util.updateFloatingText(ParkourData.getBundledData("Parkour"));
      util.shootFireworks(player.location);
      break;
  }
};

export const listener = function () {
  util.displayScoreboard(parkourTs.commonData["gameID"]);

  const playerLocation = parkourTs.commonData["player"].location;
  const blockUnder = dimension.getBlock({ x: playerLocation.x, y: playerLocation.y - 1, z: playerLocation.z });
  const parkourID = parkourTs.tempData["chapter"];

  if (
    !excludedBlocks[parkourID].has(<minecraftID.MinecraftBlockIdIF>blockUnder.typeId) &&
    !parkourTs.tempData["autoReq"] &&
    blockUnder.isSolid
  ) {
    parkourTs.stopTimer();
    parkourTs.tempData["isPlateDisabled"].start = false;
    util.teleportation(<TeleportationLocation>locationData[parkourTs.commonData["gameID"]]);
    util.updateFloatingText(ParkourData.getBundledData("Parkour"));
  }
};
