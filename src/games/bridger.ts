import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import * as data from "../data/staticData";
import * as form from "../forms/bridger";
import { bridgerTs, generalTs } from "../data/tempStorage";
import minecraftID from "../models/minecraftID";
import { IslandDireciton, TellyMode, IslandDistance } from "../models/Bridger";
import { BaseGameData } from "../data/dynamicProperty";

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
  x: 10000,
  y: 99,
  z: 10004,
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
const structures: Record<IslandDireciton, string> = {
  Straight: "straightDefault",
  Inclined: "inclinedDefault",
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
  const { tellyMode, bridgerDistance } = bridgerTs.tempData;

  const prevTellyMode = tellyMode;
  const prevDistance = prevDistanceArg ?? bridgerDistance;
  const newDistance = newDistanceArg ?? bridgerDistance;

  if (prevTellyMode === newTellyMode || !newDistance)
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

  bridgerTs.tempData["tellyMode"] = newTellyMode;
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

  // CHECK optimization??
  if (direction === "Straight") {
    fillAirLocation.end.x = fillAirLocation.start.x + 10;
    fillAirLocation.end.y = fillAirLocation.start.y + 18;
    fillAirLocation.end.z = fillAirLocation.start.z + 11;
  } else {
    fillAirLocation.end.x = fillAirLocation.start.x + 7;
    fillAirLocation.end.y = fillAirLocation.start.y + 16;
    fillAirLocation.end.z = fillAirLocation.start.z + 7;
  }

  dimension.fillBlocks(new mc.BlockVolume(fillAirLocation.start, fillAirLocation.end), "minecraft:air");

  // telly (if enabled)
  const currentTellyMode = bridgerTs.tempData["tellyMode"];
  if (currentTellyMode === "Telly") handleTellyPractice("Telly", distance1, distance2);
  if (currentTellyMode === "Speed_Telly") handleTellyPractice("Speed_Telly", distance1, distance2);

  // new structure place
  if (distance2 === 16) structurePlaceLocation = getLocation(direction, 16);
  if (distance2 === 21) structurePlaceLocation = getLocation(direction, 21);
  if (distance2 === 50) structurePlaceLocation = getLocation(direction, 50);

  // structure name
  const structure = structures[direction];

  mc.world.structureManager.place(structure, dimension, structurePlaceLocation);
};

/**
 * replace island based on distance and save in dynamic property
 */
const handleDistanceChange = function (newDistance: IslandDistance): void {
  const { bridgerDistance: prevDistance, bridgerDirection: prevDirection } = bridgerTs.tempData;

  // check whether player clicked on the same distance
  if (prevDistance === newDistance)
    return util.sendMessage("§4The distance has already been changed!", "random.anvil_land");

  fillAndPlace(prevDirection, prevDistance, newDistance);

  // set distance as dynamic property, set bridger mode for temp data
  bridgerTs.tempData["bridgerDistance"] = newDistance;

  util.sendMessage(`§aThe distance is now§r §6${newDistance} blocks§r§a!`, "random.orb");
};

/////////////////////////////////////////////////////////
export const bridgerFormHandler = async function (player: mc.Player) {
  const { selection: bridgerSelection } = await form.bridgerForm(player);

  // general
  if (bridgerSelection === 10) {
    const { selection: islandSelection } = await form.bridgerIslandForm(player);

    if (islandSelection === 10) handleDistanceChange(16);
    if (islandSelection === 19) handleDistanceChange(21);
    if (islandSelection === 28) handleDistanceChange(50);
    if (islandSelection === 12) handleTellyPractice("Telly");
    if (islandSelection === 21) handleTellyPractice("Speed_Telly");
    if (islandSelection === 30) handleTellyPractice("None");
  }

  // block
  if (bridgerSelection === 12) {
    const { selection: blockSelection } = await form.bridgerBlockForm(player);
    const blockObj = data.bridgerBlocks[blockSelection - 9];

    bridgerTs.tempData["blockBridger"] = blockObj.texture;
    util.giveItems("Bridger");
    util.sendMessage(`§aThe block has changed to§r §6${blockObj.blockName}§r§a!`, "random.orb");
  }

  // reset pb
  if (bridgerSelection === 14) {
    util.resetPB(player, "Bridger");
  }

  // quit bridger
  if (bridgerSelection === 16) util.backToLobbyKit(player, bridgerTs);
};

export const placingBlockEvt = function (block: mc.Block) {
  if (!bridgerTs.commonData["blocks"]) bridgerTs.startTimer();

  bridgerTs.commonData["blocks"]++;
  bridgerTs.commonData["storedLocations"].add(block.location);
};

export const pressurePlatePushEvt = function (player: mc.Player) {
  const { isPlateDisabled, tellyMode, bridgerDirection } = bridgerTs.tempData;

  if (isPlateDisabled) return;
  bridgerTs.tempData["isPlateDisabled"] = true;

  const time = bridgerTs.commonData.ticks;

  // if telly practice
  if (tellyMode !== "None" && bridgerDirection !== "Inclined") {
    player.playSound("random.orb");
    generalTs.stopTimer();
    util.showTitleBar(player, `§6Time§7: §f${util.tickToSec(time)}§r`);
    util.showMessage("Bridger", false, time, BaseGameData.getData("Bridger", util.getCurrentSubCategory(), "pbTicks"));
    mc.system.runTimeout(util.afterReq.bind(null, "Bridger", enablePlate), 80);
    return;
  }

  util.onRunnerSuccess("Bridger", bridgerTs, enablePlate);
};

export const listener = function () {
  util.displayScoreboard("Bridger");

  if (!(bridgerTs.commonData["player"].location.y <= 96) || bridgerTs.tempData["isPlateDisabled"]) return;

  const { tellyMode, bridgerDirection } = bridgerTs.tempData;

  // fail run
  if (tellyMode !== "None" && bridgerDirection !== "Inclined") util.onRunnerFail("Bridger", false);
  else util.onRunnerFail("Bridger", true);
};
