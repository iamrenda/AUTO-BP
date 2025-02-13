import * as mc from "@minecraft/server";
import * as util from "../utilities/utilities";
import * as data from "../data/staticData";
import * as form from "../forms/bridger";
import { bridgerTs, generalTs } from "../data/tempStorage";
import { BridgerTypesID } from "../models/DynamicProperty";
import { DynamicPropertyID } from "../models/DynamicProperty";
import { BridgerData, GameData } from "../data/dynamicProperty";
import minecraftID from "../models/minecraftID";

type IslandDistance = 16 | 21 | 50;
/////////////////////////////////////////////////////////

const BASE_LOCATION: Record<"straight" | "inclined", mc.Vector3> = {
  straight: { x: 9995, y: 89, z: 10005 },
  inclined: { x: 9957, y: 89, z: 10002 },
};

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
const TELLYBUILDERNUMBER: {
  [key: string]: {
    [key: number]: number;
  };
} = {
  Telly: {
    16: 2,
    21: 3,
    50: 8,
  },
  "Speed Telly": {
    16: 4,
    21: 5,
    50: 15,
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
  tellyType: "Telly" | "Speed Telly" | "4bFlat",
  blockType: minecraftID.MinecraftBlockIdIF
): mc.Vector3 {
  const dimension = mc.world.getDimension("overworld");
  switch (tellyType) {
    case "Telly":
      dimension.setBlockType({ x: startLocation.x, y: startLocation.y, z: startLocation.z + 4 }, blockType);
      dimension.setBlockType({ x: startLocation.x, y: startLocation.y + 1, z: startLocation.z + 6 }, blockType);
      return { x: startLocation.x, y: startLocation.y + 1, z: startLocation.z + 6 };
    case "Speed Telly":
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
  newTellyMode: "None" | "Telly" | "Speed Telly",
  prevDistanceArg?: number,
  newDistanceArg?: number
) {
  const prevTellyMode = GameData.getData("TellyPractice");
  const prevDistance = prevDistanceArg ?? GameData.getData("Distance");
  const newDistance = newDistanceArg ?? GameData.getData("Distance");

  if (prevTellyMode === newTellyMode && !newDistance)
    return util.sendMessage("§4The telly practice has already been changed!", "random.anvil_land");

  // clearing previous mode
  if (prevTellyMode === "Telly") {
    let currentLocation = TELLYSTARTBASELOCATION;
    for (let i = 0; i < TELLYBUILDERNUMBER[prevTellyMode][prevDistance]; i++)
      currentLocation = tellyPracticeBuilder(currentLocation, prevTellyMode, "minecraft:air");
  }
  if (prevTellyMode === "Speed Telly") {
    let currentLocation = TELLYSTARTBASELOCATION;

    currentLocation = tellyPracticeBuilder(currentLocation, "4bFlat", "minecraft:air");
    for (let i = 0; i < TELLYBUILDERNUMBER[prevTellyMode][prevDistance] - 1; i++)
      currentLocation = tellyPracticeBuilder(currentLocation, prevTellyMode, "minecraft:air");
  }

  // placing new practice mode
  if (newTellyMode === "Telly") {
    let currentLocation = TELLYSTARTBASELOCATION;
    for (let i = 0; i < TELLYBUILDERNUMBER[newTellyMode][newDistance]; i++)
      currentLocation = tellyPracticeBuilder(currentLocation, newTellyMode, "minecraft:red_wool");
  }
  if (newTellyMode === "Speed Telly") {
    let currentLocation = TELLYSTARTBASELOCATION;

    currentLocation = tellyPracticeBuilder(currentLocation, "4bFlat", "minecraft:red_wool");
    for (let i = 0; i < TELLYBUILDERNUMBER[newTellyMode][newDistance] - 1; i++)
      currentLocation = tellyPracticeBuilder(currentLocation, newTellyMode, "minecraft:red_wool");
  }

  if (prevDistanceArg || newDistanceArg) return;

  GameData.setData("TellyPractice", newTellyMode);
  if (newTellyMode === "None") util.sendMessage(`§aTelly practice mode has now been §cDisabled!`, "random.orb");
  else if (prevTellyMode === "None") util.sendMessage(`§aTelly practice mode has now been Enabled!`, "random.orb");
  else util.sendMessage(`§aThe change has now been made!`, "random.orb");
};

/**
 * gets the location (start fill, end fill, structure place) based on distance
 * @returns {mc.Vector3}
 */
const getLocation = function (direction: "straight" | "inclined", distance: number): mc.Vector3 {
  const baseLocation: mc.Vector3 = BASE_LOCATION[direction];
  return {
    x: direction === "straight" ? baseLocation.x : baseLocation.x - distance,
    y: baseLocation.y + HEIGHT_DIFF[distance],
    z: baseLocation.z + distance,
  };
};

/**
 * clear previous island and place new island at new location
 * @param distance1 info which filled with air
 * @param distance2 info which new structure will be built
 */
const fillAndPlace = function (
  structure: string,
  direction: "straight" | "inclined",
  distance1: IslandDistance,
  distance2: IslandDistance
) {
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

  if (direction === "straight") {
    fillAirLocation.end.x = fillAirLocation.start.x + 12;
    fillAirLocation.end.y = fillAirLocation.start.y + 38;
    fillAirLocation.end.z = fillAirLocation.start.z + 11;
  } else {
    fillAirLocation.end.x = fillAirLocation.start.x + 11;
    fillAirLocation.end.y = fillAirLocation.start.y + 38;
    fillAirLocation.end.z = fillAirLocation.start.z + 11;
  }

  dimension.fillBlocks(new mc.BlockVolume(fillAirLocation.start, fillAirLocation.end), "minecraft:air");

  // telly (if enabled)
  const currentTellyMode = GameData.getData("TellyPractice");
  if (currentTellyMode === "Telly") handleTellyPractice("Telly", distance1, distance2);
  if (currentTellyMode === "Speed Telly") handleTellyPractice("Speed Telly", distance1, distance2);

  // new structure place
  if (distance2 === 16) structurePlaceLocation = getLocation(direction, 16);
  if (distance2 === 21) structurePlaceLocation = getLocation(direction, 21);
  if (distance2 === 50) structurePlaceLocation = getLocation(direction, 50);

  mc.world.structureManager.place(structure, dimension, structurePlaceLocation);
};

/**
 * replace island based on distance and save in dynamic property
 */
const handleDistanceChange = function (blocks: IslandDistance): void {
  // check whether player clicked on the same distance
  if (GameData.getData("Distance") === blocks)
    return util.sendMessage("§4The distance has already been changed!", "random.anvil_land");

  fillAndPlace(
    data.structures[bridgerTs.tempData["bridgerDirection"]],
    bridgerTs.tempData["bridgerDirection"],
    GameData.getData("Distance"),
    blocks
  );

  // set distance as dynamic property, set bridger mode for temp data
  GameData.setData("Distance", blocks);
  util.setBridgerMode(<BridgerTypesID>`${bridgerTs.tempData["bridgerDirection"]}${blocks}blocks`);

  util.sendMessage(`§aThe distance is now§r §6${blocks} blocks§r§a!`, "random.orb");
  util.updateFloatingText(BridgerData.getBundledData("Bridger"));
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
    if (islandSelection === 21) handleTellyPractice("Speed Telly");
    if (islandSelection === 30) handleTellyPractice("None");
  }

  // block
  if (bridgerSelection === 12) {
    const { selection: blockSelection } = await form.bridgerBlockForm(player);
    const blockObj = data.formBlocks[blockSelection - 9];

    bridgerTs.tempData["blockBridger"] = blockObj.texture;
    util.giveItems(`straightBridger`);
    util.sendMessage(`§aThe block has changed to§r §6${blockObj.blockName}§r§a!`, "random.orb");
  }

  // reset pb
  if (bridgerSelection === 14) {
    const distance = GameData.getData("Distance");
    util.resetPB(player, BridgerData, `${distance} blocks`, "Bridger");
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
  if (bridgerTs.tempData["isPlateDisabled"]) return;
  bridgerTs.tempData["isPlateDisabled"] = true;

  const time = bridgerTs.commonData.ticks;

  // if telly practice
  if (GameData.getData("TellyPractice") !== "None" && bridgerTs.tempData["bridgerDirection"] !== "inclined") {
    player.playSound("random.orb");
    generalTs.stopTimer();
    util.showTitleBar(player, `§6Time§7: §f${util.tickToSec(time)}§r`);
    util.showMessage(false, time, BridgerData.getData(DynamicPropertyID.Bridger_PB));
    mc.system.runTimeout(util.afterReq.bind(null, BridgerData, enablePlate), 80);
    return;
  }

  util.onRunnerSuccess(bridgerTs, BridgerData, enablePlate);
};

export const listener = function () {
  util.displayScoreboard("straightBridger");

  if (!(bridgerTs.commonData["player"].location.y <= 96) || bridgerTs.tempData["isPlateDisabled"]) return;

  // fail run
  if (GameData.getData("TellyPractice") !== "None" && bridgerTs.tempData["bridgerDirection"] !== "inclined")
    util.onRunnerFail(BridgerData, false);
  else util.onRunnerFail(BridgerData, true);
};
