import MinecraftID from "../models/minecraftID";
import GameID, { ParentGameID } from "../models/GameID";
import { bridgerTs } from "./tempStorage";
import { ItemInfo, TeleportationLocation } from "../models/general";

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
export const InventoryData: Record<ParentGameID, ItemInfo[]> = {
  Lobby: [
    { item: "minecraft:stick", quantity: 1, slot: 0, name: "§9Launching Stick" },
    { item: "minecraft:compass", quantity: 1, slot: 4, name: "§bNavigator" },
    { item: "minecraft:book", quantity: 1, slot: 7, name: "§dCredits" },
    { item: "minecraft:flint", quantity: 1, slot: 8, name: "§7Back to Lobby" },
  ],
  Bridger: [
    { item: bridgerTs.tempData["blockBridger"], quantity: 64 },
    { item: bridgerTs.tempData["blockBridger"], quantity: 64 },
    { item: "minecraft:diamond_pickaxe", quantity: 1, name: "§3Miner's Pickaxe" },
    { item: "minecraft:book", quantity: 1, slot: 8 },
  ],
  Clutcher: [
    { item: "minecraft:sandstone", quantity: 64 },
    { item: "minecraft:book", quantity: 1, slot: 8 },
  ],
  Wall_Run: [
    { item: "minecraft:white_wool", quantity: 64 },
    { item: "minecraft:book", quantity: 1, slot: 8 },
  ],
  Bedwars_Rush: [
    { item: "minecraft:white_wool", quantity: 64 },
    { item: "minecraft:white_wool", quantity: 64 },
    { item: "minecraft:book", quantity: 1, slot: 8 },
  ],
  Fist_Reduce: [
    { item: "minecraft:sandstone", quantity: 64 },
    { item: "minecraft:sandstone", quantity: 64 },
    { item: "minecraft:book", quantity: 1, slot: 8 },
  ],
  Parkour: [{ item: "minecraft:book", quantity: 1, slot: 8 }],
  Wool_Parkour: [
    { item: "minecraft:white_wool", quantity: 64 },
    { item: "minecraft:book", quantity: 1, slot: 8 },
  ],
};

export const locationData: Record<GameID, TeleportationLocation> = {
  Lobby: {
    position: { x: 91.5, y: 262.0, z: 63.5 },
    facing: { x: 91.5, y: 262.0, z: 64 },
  },

  Bridger$Straight_16_blocks: {
    position: { x: 10002.5, y: 102, z: 10000.5 },
    facing: { x: 10002.5, y: 102, z: 10001 },
  },
  Bridger$Straight_21_blocks: {
    position: { x: 10002.5, y: 102, z: 10000.5 },
    facing: { x: 10002.5, y: 102, z: 10001 },
  },
  Bridger$Straight_50_blocks: {
    position: { x: 10002.5, y: 102, z: 10000.5 },
    facing: { x: 10002.5, y: 102, z: 10001 },
  },
  Bridger$Inclined_16_blocks: {
    position: { x: 9965.5, y: 102, z: 10001.5 },
    facing: { x: 9965, y: 102, z: 10002 },
  },
  Bridger$Inclined_21_blocks: {
    position: { x: 9965.5, y: 102, z: 10001.5 },
    facing: { x: 9965, y: 102, z: 10002 },
  },
  Bridger$Inclined_50_blocks: {
    position: { x: 9965.5, y: 102, z: 10001.5 },
    facing: { x: 9965, y: 102, z: 10002 },
  },

  Clutcher: {
    position: { x: 19999.5, y: 104, z: 20002.5 },
    facing: { x: 19999.5, y: 104, z: 20003 },
  },

  Wall_Run$Ancient: {
    position: { x: 30009.5, y: 105, z: 30013.5 },
    facing: { x: 30009.5, y: 105, z: 30014 },
  },

  Bedwars_Rush$Custom_Map: {
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
  Fist_Reduce$Normal: {
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
  Fist_Reduce$LIMITLESS: {
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
  "Parkour$Chapter_1.1": {
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
  "Parkour$Chapter_1.2": {
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
  "Parkour$Chapter_1.3": {
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
  "Parkour$Chapter_2.1": {
    position: {
      x: 60150.5,
      y: 83,
      z: 60010.5,
    },
    facing: {
      x: 60150,
      y: 83,
      z: 60011,
    },
  },
  "Parkour$Chapter_2.2": {
    position: {
      x: 60213.5,
      y: 92,
      z: 60018.5,
    },
    facing: {
      x: 60214,
      y: 92,
      z: 60019,
    },
  },
  Wool_Parkour$Oak_1: {
    position: {
      x: 70001.5,
      y: 101,
      z: 70001.5,
    },
    facing: {
      x: 70002,
      y: 101,
      z: 70001.5,
    },
  },
  Wool_Parkour$Oak_2: {
    position: {
      x: 70001.5,
      y: 100,
      z: 70018.5,
    },
    facing: {
      x: 70002,
      y: 100,
      z: 70018.5,
    },
  },
  Wool_Parkour$Oak_3: {
    position: {
      x: 70002.5,
      y: 98,
      z: 70036.5,
    },
    facing: {
      x: 70003,
      y: 98,
      z: 70036.5,
    },
  },
  Wool_Parkour$Prismarine_1: {
    position: {
      x: 70002.5,
      y: 99,
      z: 70058.5,
    },
    facing: {
      x: 70003,
      y: 99,
      z: 70058.5,
    },
  },
  Wool_Parkour$Prismarine_2: {
    position: {
      x: 70002.5,
      y: 99,
      z: 70078.5,
    },
    facing: {
      x: 70003,
      y: 99,
      z: 70078.5,
    },
  },
  Wool_Parkour$Prismarine_3: {
    position: {
      x: 70002.5,
      y: 97,
      z: 70098.5,
    },
    facing: {
      x: 70003,
      y: 97,
      z: 70098.5,
    },
  },
};

/**
 * blockName: block's name to display
 * texture: block's texture's name
 */
export const bridgerBlocks: DisplayBlockIF[] = [
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
export const VERSION = 7;
