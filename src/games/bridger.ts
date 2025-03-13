import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import * as data from "../data/staticData";
import * as form from "../forms/bridger";
import minecraftID from "../models/minecraftID";
import { bridgerTs, generalTs } from "../data/tempStorage";
import { IslandDireciton, TellyMode, IslandDistance } from "../models/Bridger";
import { BaseGameData, gameData } from "../data/dynamicProperty";
import { BreakingAnimation } from "../models/general";

// the location to start placing the structure blocks
const BASE_LOCATION: Record<IslandDireciton, mc.Vector3> = {
  Straight: { x: 9998, y: 91, z: 10004 },
  Inclined: { x: 9957, y: 91, z: 10003 },
};

// height difference of bridgers
const HEIGHT_DIFF: Record<number, number> = {
  16: 1,
  21: 2,
  50: 5,
};

//where to start building telly practice
const TELLYSTARTBASELOCATION: mc.Vector3 = {
  x: 10002,
  y: 101,
  z: 10003,
};

// the number of telly set to build for each mode
const TELLYBUILDER_NUMBER: Record<Exclude<TellyMode, "None">, Record<IslandDistance, number>> = {
  Telly: {
    16: 2,
    21: 3,
    50: 8,
  },
  Speed_Telly: {
    16: 4,
    21: 5,
    50: 15,
  },
};

// structure names
const mcStructureName: Record<IslandDireciton, string> = {
  Straight: "straightDefault",
  Inclined: "inclinedDefault",
};

const mcStructureSizes: Record<IslandDireciton, mc.Vector3> = {
  Straight: {
    x: 10,
    y: 18,
    z: 11,
  },
  Inclined: {
    x: 7,
    y: 16,
    z: 7,
  },
};
/////////////////////////////////////////////////////////
/**
 * re-enable pressure plate (disabled temp when plate is pressed)
 */
const enablePlate = function (): void {
  bridgerTs.tempData["isPlateDisabled"] = false;
};

/**
 * places a block for telly practice depending on telly type
 */
const tellyPracticeBuilder = function (
  startLocation: mc.Vector3,
  tellyType: Exclude<TellyMode, "None"> | "4bFlat",
  blockType: minecraftID.MinecraftBlockIdIF
): mc.Vector3 {
  const dimension = mc.world.getDimension("overworld");
  switch (tellyType) {
    case "Telly":
      dimension.setBlockType({ x: startLocation.x, y: startLocation.y, z: startLocation.z + 4 }, blockType);
      dimension.setBlockType({ x: startLocation.x, y: startLocation.y + 1, z: startLocation.z + 6 }, blockType);
      return { x: startLocation.x, y: startLocation.y + 1, z: startLocation.z + 6 };
    case "Speed_Telly":
      dimension.setBlockType({ x: startLocation.x, y: startLocation.y + 1, z: startLocation.z + 3 }, blockType);
      return { x: startLocation.x, y: startLocation.y + 1, z: startLocation.z + 3 };
    case "4bFlat":
      dimension.setBlockType({ x: startLocation.x, y: startLocation.y, z: startLocation.z + 4 }, blockType);
      return { x: startLocation.x, y: startLocation.y, z: startLocation.z + 4 };
  }
};

/**
 * handling telly practice (activates also from distance change)
 * (prev && new distance is required when distance changes)
 */
const handleTellyPractice = function (
  newTellyMode: TellyMode,
  prevDistanceArg?: IslandDistance,
  newDistanceArg?: IslandDistance
) {
  const { bridgerDirection } = bridgerTs.tempData;
  const tellyMode = gameData.getData("BridgerStraightTellyMode");
  const bridgerDistance = gameData.getData(`Bridger${bridgerDirection}Distance`);

  const prevTellyMode = tellyMode;
  const prevDistance = prevDistanceArg ?? bridgerDistance;
  const newDistance = newDistanceArg ?? bridgerDistance;

  if (prevTellyMode === newTellyMode && !newDistance)
    return util.sendMessage("§4The telly practice has already been changed!", "random.anvil_land");

  // clearing previous mode
  if (prevTellyMode === "Telly") {
    let currentLocation = TELLYSTARTBASELOCATION;
    for (let i = 0; i < TELLYBUILDER_NUMBER[prevTellyMode][prevDistance]; i++)
      currentLocation = tellyPracticeBuilder(currentLocation, prevTellyMode, "minecraft:air");
  }
  if (prevTellyMode === "Speed_Telly") {
    let currentLocation = TELLYSTARTBASELOCATION;

    currentLocation = tellyPracticeBuilder(currentLocation, "4bFlat", "minecraft:air");
    for (let i = 0; i < TELLYBUILDER_NUMBER[prevTellyMode][prevDistance] - 1; i++)
      currentLocation = tellyPracticeBuilder(currentLocation, prevTellyMode, "minecraft:air");
  }

  // placing new practice mode
  if (newTellyMode === "Telly") {
    let currentLocation = TELLYSTARTBASELOCATION;
    for (let i = 0; i < TELLYBUILDER_NUMBER[newTellyMode][newDistance]; i++)
      currentLocation = tellyPracticeBuilder(currentLocation, newTellyMode, "minecraft:red_wool");
  }
  if (newTellyMode === "Speed_Telly") {
    let currentLocation = TELLYSTARTBASELOCATION;

    currentLocation = tellyPracticeBuilder(currentLocation, "4bFlat", "minecraft:red_wool");
    for (let i = 0; i < TELLYBUILDER_NUMBER[newTellyMode][newDistance] - 1; i++)
      currentLocation = tellyPracticeBuilder(currentLocation, newTellyMode, "minecraft:red_wool");
  }

  if (prevDistanceArg || newDistanceArg) return;

  gameData.setData("BridgerStraightTellyMode", newTellyMode);
  if (newTellyMode === "None") util.sendMessage(`§aTelly practice mode has now been §cDisabled!`, "random.orb");
  else if (prevTellyMode === "None") util.sendMessage(`§aTelly practice mode has now been Enabled!`, "random.orb");
  else util.sendMessage(`§aThe change has now been made!`, "random.orb");
};

/**
 * gets the location (start fill, end fill, structure place) based on distance
 * @returns {mc.Vector3}
 */
const getLocation = function (direction: IslandDireciton, distance: number): mc.Vector3 {
  const baseLocation: mc.Vector3 = BASE_LOCATION[direction];
  return {
    x: direction === "Straight" ? baseLocation.x : baseLocation.x - distance,
    y: baseLocation.y + HEIGHT_DIFF[distance],
    z: baseLocation.z + distance,
  };
};

/**
 * clear previous island and place new island at new location
 * @param distance1 info which filled with air
 * @param distance2 info which new structure will be built
 */
const fillAndPlace = function (direction: IslandDireciton, distance1: IslandDistance, distance2: IslandDistance) {
  const dimension = mc.world.getDimension("overworld");
  const fillAirLocation: Record<string, mc.Vector3> = {
    start: { x: undefined, y: undefined, z: undefined },
    end: { x: undefined, y: undefined, z: undefined },
  };
  let structurePlaceLocation: mc.Vector3 = { x: undefined, y: undefined, z: undefined };

  // fill air
  if (distance1 === 16) fillAirLocation.start = getLocation(direction, 16);
  if (distance1 === 21) fillAirLocation.start = getLocation(direction, 21);
  if (distance1 === 50) fillAirLocation.start = getLocation(direction, 50);

  if (direction === "Straight") {
    fillAirLocation.end.x = fillAirLocation.start.x + mcStructureSizes.Straight.x;
    fillAirLocation.end.y = fillAirLocation.start.y + mcStructureSizes.Straight.y;
    fillAirLocation.end.z = fillAirLocation.start.z + mcStructureSizes.Straight.z;
  } else {
    fillAirLocation.end.x = fillAirLocation.start.x + mcStructureSizes.Inclined.x;
    fillAirLocation.end.y = fillAirLocation.start.y + mcStructureSizes.Inclined.y;
    fillAirLocation.end.z = fillAirLocation.start.z + mcStructureSizes.Inclined.z;
  }

  dimension.fillBlocks(new mc.BlockVolume(fillAirLocation.start, fillAirLocation.end), "minecraft:air");

  // telly (if enabled)
  const currentTellyMode = gameData.getData("BridgerStraightTellyMode");
  if (currentTellyMode === "Telly") handleTellyPractice("Telly", distance1, distance2);
  if (currentTellyMode === "Speed_Telly") handleTellyPractice("Speed_Telly", distance1, distance2);

  // new structure place
  if (distance2 === 16) structurePlaceLocation = getLocation(direction, 16);
  if (distance2 === 21) structurePlaceLocation = getLocation(direction, 21);
  if (distance2 === 50) structurePlaceLocation = getLocation(direction, 50);

  // structure name
  const structure = mcStructureName[direction];

  mc.world.structureManager.place(structure, dimension, structurePlaceLocation);
};

/**
 * replace island based on distance and save in dynamic property
 */
const handleDistanceChange = function (newDistance: IslandDistance): void {
  const { bridgerDirection: prevDirection } = bridgerTs.tempData;
  const prevDistance = gameData.getData(`Bridger${prevDirection}Distance`);

  // check whether player clicked on the same distance
  if (prevDistance === newDistance)
    return util.sendMessage("§4The distance has already been changed!", "random.anvil_land");

  fillAndPlace(prevDirection, prevDistance, newDistance);

  gameData.setData(`Bridger${prevDirection}Distance`, newDistance);
  bridgerTs.commonData["gameID"] = `Bridger$${prevDirection}_${newDistance}_blocks`;

  util.sendMessage(`§aThe distance is now§r §6${newDistance} blocks§a!`, "random.orb");
};

const handleBreakingAnimation = function (animation: BreakingAnimation) {
  if (bridgerTs.tempData["breakingAnimation"] === animation)
    util.sendMessage("§4The animation has already been changed!", "random.anvil_land");
  bridgerTs.tempData["breakingAnimation"] = animation;
  util.sendMessage(`§aThe animation is now§r §6${animation}§a!`, "random.orb");
};

const generalFormSelections: Record<number, [Function, any]> = {
  10: [handleDistanceChange, 16],
  19: [handleDistanceChange, 21],
  28: [handleDistanceChange, 50],

  12: [handleTellyPractice, "Telly"],
  21: [handleTellyPractice, "Speed_Telly"],
  30: [handleTellyPractice, "None"],

  14: [handleBreakingAnimation, "Falling Domino"],
  23: [handleBreakingAnimation, "Falling"],
  32: [handleBreakingAnimation, "Domino"],
  41: [handleBreakingAnimation, "None"],
};

/////////////////////////////////////////////////////////
export const bridgerFormHandler = async function (player: mc.Player) {
  const { selection: bridgerSelection, canceled } = await form.bridgerForm(player);
  if (canceled) return;

  switch (bridgerSelection) {
    // general
    case 10:
      const { selection: generalSelection, canceled } = await form.bridgerGeneralForm(player);
      if (canceled) return;

      const [func, arg] = generalFormSelections[generalSelection];
      func(arg);
      break;

    // block
    case 12:
      const { selection: blockSelection } = await form.bridgerBlockForm(player);
      const blockObj = data.bridgerBlocks[blockSelection - 9];

      bridgerTs.tempData["blockBridger"] = blockObj.texture;
      util.giveItems("Bridger");
      util.sendMessage(`§aThe block has changed to§r §6${blockObj.blockName}§r§a!`, "random.orb");
      break;

    // reset pb
    case 14:
      util.resetPB(player, "Bridger");
      break;

    // quit bridger
    case 16:
      util.backToLobbyKit(player, bridgerTs);
      break;
  }
};

export const placingBlockEvt = function (block: mc.Block) {
  if (!bridgerTs.commonData["blocks"]) bridgerTs.startTimer();

  bridgerTs.commonData["blocks"]++;
  bridgerTs.commonData["storedLocations"].add(block.location);
};

export const pressurePlatePushEvt = function ({ source: player }: { source: mc.Entity }) {
  if (!(player instanceof mc.Player)) return;

  const { isPlateDisabled, bridgerDirection } = bridgerTs.tempData;
  const tellyMode = gameData.getData("BridgerStraightTellyMode");

  if (isPlateDisabled) return;
  bridgerTs.tempData["isPlateDisabled"] = true;

  const time = bridgerTs.commonData.ticks;

  // if telly practice
  if (tellyMode !== "None" && bridgerDirection !== "Inclined") {
    player.playSound("random.orb");
    generalTs.stopTimer();
    util.showTitleBar(player, `§6Time§7: §f${util.tickToSec(time)}§r`);
    util.showGoalMessage(
      "Bridger",
      false,
      time,
      BaseGameData.getData("Bridger", util.getCurrentSubCategory(), "pbTicks")
    );
    mc.system.runTimeout(util.afterReq.bind(null, "Bridger", enablePlate), 80);
    return;
  }

  util.giveItems([{ item: "minecraft:book", quantity: 1, slot: 8 }]);

  util.onRunnerSuccess("Bridger", bridgerTs, enablePlate);
};

export const listener = function () {
  util.displayScoreboard("Bridger");

  if (!(bridgerTs.commonData["player"].location.y <= 96) || bridgerTs.tempData["isPlateDisabled"]) return;

  const { bridgerDirection } = bridgerTs.tempData;
  const tellyMode = gameData.getData("BridgerStraightTellyMode");

  // fail run
  if (tellyMode !== "None" && bridgerDirection !== "Inclined") util.onRunnerFail("Bridger", undefined, false);
  else util.onRunnerFail("Bridger", undefined, true);
};
