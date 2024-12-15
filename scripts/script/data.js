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

const blocks = [
  { blockName: "Sandstone", texture: "minecraft:sandstone" },
  { blockName: "Oak Planks", texture: "minecraft:oak_planks" },
  { blockName: "Bamboo Planks", texture: "minecraft:bamboo_planks" },
  { blockName: "White Stained Glass", texture: "minecraft:white_stained_glass" },
  { blockName: "Cobblestone", texture: "minecraft:cobblestone" },
  { blockName: "Amethyst Block", texture: "minecraft:amethyst_block" },
  { blockName: "White Wool", texture: "minecraft:white_wool" },
  { blockName: "Crying Obsidian", texture: "minecraft:crying_obsidian" },
  { blockName: "Barrier", texture: "minecraft:barrier" },
];

// this data is contained based on the texture's name, not the name itself!
const tempData = {
  block: "minecraft:sandstone",
  stairCased: true,
  pickaxe: "minecraft:wooden_pickaxe",
  goalSound: "default",
};

export { games, locationData, tempData, blocks };
