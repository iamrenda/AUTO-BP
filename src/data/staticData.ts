import MinecraftID from "../models/minecraftID";
import ItemInfo from "../models/ItemInfo";
import GameID from "../models/GameID";
import { bridgerTs } from "./tempStorage";
import TeleportationLocation from "../models/TeleportationLocation";

////////////////////
// INTERFACE
type DisplayBlockIF = {
  blockName: string;
  texture: MinecraftID.MinecraftBlockIdIF;
};

type ClutchStrengthIF = {
  [kbStrength: number]: { texture: MinecraftID.MinecraftBlockIdIF; name: string; strength: number };
};

////////////////////
// EXPORTS
/**
 * getInvData: get inventory data for giveItems
 */
export const getInvData = function (game: GameID): ItemInfo[] {
  if (game === "lobby")
    return [
      { item: "minecraft:stick", quantity: 1, slot: 0, name: "§9Launching Stick" },
      { item: "minecraft:white_wool", quantity: 63, slot: 1 },
      { item: "minecraft:compass", quantity: 1, slot: 4, name: "§bNavigator" },
      { item: "minecraft:book", quantity: 1, slot: 7, name: "§dCredits" },
      { item: "minecraft:flint", quantity: 1, slot: 8, name: "§7Back to Lobby" },
    ];
  if (game === "straightBridger" || game === "inclinedBridger")
    return [
      { item: bridgerTs.tempData["blockBridger"], quantity: 64 },
      { item: bridgerTs.tempData["blockBridger"], quantity: 64 },
      { item: "minecraft:diamond_pickaxe", quantity: 1, name: "§3Miner's Pickaxe" },
      { item: "minecraft:book", quantity: 1, slot: 8 },
    ];
  if (game === "clutcher")
    return [
      { item: "minecraft:sandstone", quantity: 64 },
      { item: "minecraft:book", quantity: 1, slot: 8 },
    ];
  if (game === "wallRun")
    return [
      { item: "minecraft:white_wool", quantity: 64 },
      { item: "minecraft:book", quantity: 1, slot: 8 },
    ];
  if (game === "bedwarsRush")
    return [
      { item: "minecraft:white_wool", quantity: 64 },
      { item: "minecraft:white_wool", quantity: 64 },
      { item: "minecraft:book", quantity: 1, slot: 8 },
    ];
  if (game === "normalFistReduce" || game === "limitlessFistReduce")
    return [
      { item: "minecraft:sandstone", quantity: 64 },
      { item: "minecraft:sandstone", quantity: 64 },
      { item: "minecraft:book", quantity: 1, slot: 8 },
    ];
  if (game === "parkour1_1" || game === "parkour1_2" || game === "parkour1_3")
    return [{ item: "minecraft:book", quantity: 1, slot: 8 }];
};

/**
 * locationData: lcoation to teleport when player joining to a game
 */
type LocationData = {
  lobby: TeleportationLocation;
  straightBridger: TeleportationLocation;
  inclinedBridger: TeleportationLocation;
  clutcher: TeleportationLocation[];
  wallRun: TeleportationLocation;
  bedwarsRush: TeleportationLocation;
  normalFistReduce: TeleportationLocation;
  limitlessFistReduce: TeleportationLocation;
  parkour1_1: TeleportationLocation;
  parkour1_2: TeleportationLocation;
  parkour1_3: TeleportationLocation;
};

export const locationData: LocationData = {
  lobby: {
    position: { x: 91.5, y: 262.0, z: 63.5 },
    facing: { x: 91.5, y: 262.0, z: 64 },
  },
  straightBridger: {
    position: { x: 10000.5, y: 100, z: 10001.5 },
    facing: { x: 10000.5, y: 100, z: 10002 },
  },
  inclinedBridger: {
    position: { x: 9968.5, y: 100, z: 10000.5 },
    facing: { x: 9968, y: 100, z: 10001 },
  },
  clutcher: [
    {
      position: { x: 19999.5, y: 104, z: 20002.5 },
      facing: { x: 19999.5, y: 104, z: 20003 },
    },
    {
      position: { x: 19978.5, y: 104, z: 20031.5 },
      facing: { x: 19979, y: 104, z: 20031.5 },
    },
    {
      position: { x: 20007.5, y: 103, z: 20052.5 },
      facing: { x: 20007.5, y: 103, z: 20052 },
    },
    {
      position: { x: 20027.5, y: 104, z: 20023.5 },
      facing: { x: 20027, y: 104, z: 20023.5 },
    },
  ],
  wallRun: {
    position: { x: 30009.5, y: 105, z: 30013.5 },
    facing: { x: 30009.5, y: 105, z: 30014 },
  },
  bedwarsRush: {
    position: {
      x: 40097.5,
      y: 102,
      z: 40029.5,
    },
    facing: {
      x: 40097,
      y: 102,
      z: 40029.5,
    },
  },
  normalFistReduce: {
    position: {
      x: 50008.5,
      y: 102,
      z: 50014.5,
    },
    facing: {
      x: 50008.5,
      y: 102,
      z: 50015,
    },
  },
  limitlessFistReduce: {
    position: {
      x: 50008.5,
      y: 320,
      z: 50014.5,
    },
    facing: {
      x: 50008.5,
      y: 320,
      z: 50015,
    },
  },
  parkour1_1: {
    position: {
      x: 60053.5,
      y: 86,
      z: 60084.5,
    },
    facing: {
      x: 60053,
      y: 86,
      z: 60084,
    },
  },
  parkour1_2: {
    position: {
      x: 60040.5,
      y: 102,
      z: 60058.5,
    },
    facing: {
      x: 60041,
      y: 102,
      z: 60059,
    },
  },
  parkour1_3: {
    position: {
      x: 60077.5,
      y: 80,
      z: 60059.5,
    },
    facing: {
      x: 60075.5,
      y: 80,
      z: 60058.5,
    },
  },
};

/**
 * blockName: block's name to display
 * texture: block's texture's name
 */
export const formBlocks: DisplayBlockIF[] = [
  { blockName: "Sandstone", texture: "minecraft:sandstone" },
  { blockName: "Oak Planks", texture: "minecraft:oak_planks" },
  { blockName: "Bamboo Planks", texture: "minecraft:bamboo_planks" },
  { blockName: "White Glazed Terracotta", texture: "minecraft:white_glazed_terracotta" },
  { blockName: "Cobblestone", texture: "minecraft:cobblestone" },
  { blockName: "Amethyst Block", texture: "minecraft:amethyst_block" },
  { blockName: "White Wool", texture: "minecraft:white_wool" },
  { blockName: "Crying Obsidian", texture: "minecraft:crying_obsidian" },
  { blockName: "Barrier Block", texture: "minecraft:barrier" },
];

/**
 * for bridger
 * name: name of the structure to display
 * file: file name to load
 */
export const structures = {
  straight: "straightDefault",
  inclined: "inclinedDefault",
};

/**
 * for clutcher
 * knockback strength with name & texture
 */
export const clutchStrength: ClutchStrengthIF = {
  1: {
    texture: "minecraft:lime_stained_glass",
    name: "§aLight",
    strength: 2,
  },
  2: {
    texture: "minecraft:yellow_stained_glass",
    name: "§eMedium",
    strength: 3,
  },
  3: {
    texture: "minecraft:red_stained_glass",
    name: "§cHard",
    strength: 5,
  },
};

/**
 * AUTO World version
 */
export const VERSION = 6;
