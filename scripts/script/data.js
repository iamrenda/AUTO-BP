import dynamicProperty from "./dynamicProperty";

const games = ["straight16b", "straight25b", "straight50b", "incline16b", "incline25b", "incline50b"];

const locationData = {
  lobby: {
    position: { x: 91.5, y: 262.0, z: 63.5 },
    facing: { x: 91.5, y: 262.0, z: 64 },
  },
  bridger: {
    straight: {
      position: { x: 10000.5, y: 100, z: 10000.5 },
      facing: { x: 10000.5, y: 100, z: 10001 },
    },
  },
};

/**
 * blockName: block's name to display
 * texture: block's texture's name
 */
const blocks = [
  { blockName: "Sandstone", texture: "minecraft:sandstone" },
  { blockName: "Oak Planks", texture: "minecraft:oak_planks" },
  { blockName: "Bamboo Planks", texture: "minecraft:bamboo_planks" },
  { blockName: "White Stained Glass", texture: "minecraft:white_stained_glass" },
  { blockName: "Cobblestone", texture: "minecraft:cobblestone" },
  { blockName: "Amethyst Block", texture: "minecraft:amethyst_block" },
  { blockName: "White Wool", texture: "minecraft:white_wool" },
  { blockName: "Crying Obsidian", texture: "minecraft:crying_obsidian" },
  { blockName: "Barrier Block", texture: "minecraft:barrier" },
];

/**
 * name: name of the structure to display
 * file: file name to load
 * location: [0] - location to load the file
 *           [0] & [1] - locations to fill air
 */
const structure = [
  {
    name: "default",
    file: "mystructure:default",
    location: {
      flat: [
        { x: 9993, y: 93, z: 10024 },
        { x: 10005, y: 106, z: 10033 },
      ],
      stairCased: [
        { x: 9993, y: 95, z: 10024 },
        { x: 10005, y: 108, z: 10033 },
      ],
    },
  },
];

/**
 * block: minecraft block name to bridge with
 * stairCased: whether difference in y-axis is neccessary or not
 * pickaxe: minecraft item name to use as a pickaxe
 */
const tempData = {
  block: "minecraft:sandstone",
  structureIndex: 0, // CHECK hard coded
  stairCased: dynamicProperty.getBoolean("straightHeight"),
  pickaxe: "minecraft:wooden_pickaxe",
};

export { games, locationData, tempData, structure, blocks };
