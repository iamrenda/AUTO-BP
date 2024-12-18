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
const structures = [
  {
    name: "default",
    file: "mystructure:default",
  },
];

/**
 * block: minecraft block name to bridge with
 * stairCased: whether difference in y-axis is neccessary or not
 */
const tempData = {
  block: "minecraft:sandstone",
  structureIndex: 0, // CHECK hard coded
};

export { locationData, tempData, structures, blocks };
