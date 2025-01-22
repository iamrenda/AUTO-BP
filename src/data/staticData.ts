import MinecraftID from "../models/minecraftID";
import TeleportationLocation from "../models/TeleportationLocation";
import ItemInfo from "../models/ItemInfo";
import GameID from "../models/GameID";
import { bridgerTs, clutcherTs } from "./tempStorage";

////////////////////
// INTERFACE
type LocationDataIF = {
  [key in GameID]: TeleportationLocation | TeleportationLocation[];
};

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
      { item: "minecraft:stick", quantity: 1, slot: 2, name: "§9Launching Stick" },
      { item: "minecraft:compass", quantity: 1, slot: 4, name: "§fNavigator" },
      { item: "minecraft:book", quantity: 1, slot: 6, name: "§dCredits" },
    ];
  if (game === "straightBridger" || game === "inclinedBridger")
    return [
      { item: bridgerTs.tempData["blockBridger"], quantity: 64 },
      { item: bridgerTs.tempData["blockBridger"], quantity: 64 },
      { item: "minecraft:book", quantity: 1, slot: 8 },
    ];
  if (game === "clutcher")
    return [
      { item: clutcherTs.tempData["clutcherBlock"], quantity: 64 },
      { item: "minecraft:book", quantity: 1, slot: 8 },
    ];
  if (game === "wallRun")
    return [
      { item: "minecraft:white_wool", quantity: 64 },
      { item: "minecraft:book", quantity: 1, slot: 8 },
    ];
  if (game === "bedwarsRush")
    return [
      { item: "minecraft:red_wool", quantity: 64 },
      { item: "minecraft:red_wool", quantity: 64 },
      { item: "minecraft:book", quantity: 1, slot: 8 },
    ];
};

/**
 * locationData: lcoation to teleport when player joining to a game
 */
export const locationData: LocationDataIF = {
  lobby: {
    position: { x: 91.5, y: 262.0, z: 63.5 },
    facing: { x: 91.5, y: 262.0, z: 64 },
  },
  straightBridger: {
    position: { x: 10000.5, y: 100, z: 10001.5 },
    facing: { x: 10000.5, y: 100, z: 10002 },
  },
  inclinedBridger: {
    position: { x: 9978.5, y: 100, z: 10002.5 },
    facing: { x: 9978, y: 100, z: 10003 },
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
      x: 40068.5,
      y: 105,
      z: 40007.5,
    },
    facing: {
      x: 40068,
      y: 105,
      z: 40007.5,
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

export const VERSION = 5;
