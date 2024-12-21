/**
 * block: minecraft block name to bridge with
 */
const tempData = {
  blockBridger: "minecraft:sandstone",
  blockClutcher: "auto:custom_sandstone",
  clutch: [1],
};

/**
 * getInvData: get inventory data for giveItems
 *
 * @param {String} game - the inventory data to retrieve based on the game
 */
const getInvData = function (game) {
  if (game === "lobby")
    return [
      { item: "minecraft:stick", quantity: 1, slot: 2, name: "§9Launching Stick" },
      { item: "minecraft:compass", quantity: 1, slot: 4, name: "§fNavigator" },
      { item: "minecraft:book", quantity: 1, slot: 6, name: "§dCredits" },
    ];
  if (game === "bridger")
    return [
      { item: tempData.blockBridger, quantity: 64 },
      { item: tempData.blockBridger, quantity: 64 },
      { item: "minecraft:book", quantity: 1, slot: 8 },
    ];
  if (game === "clutcher")
    return [
      { item: tempData.blockClutcher, quantity: 255 },
      { item: "minecraft:book", quantity: 1, slot: 8 },
    ];
};

/**
 * locationData: lcoation to teleport when player joining to a game
 */
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
  clutcher: {
    position: { x: 20000.5, y: 100, z: 20000.5 },
    facing: { x: 20000.5, y: 100, z: 20001 },
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
  { blockName: "White Glazed Terracotta", texture: "minecraft:white_glazed_terracotta" },
  { blockName: "Cobblestone", texture: "minecraft:cobblestone" },
  { blockName: "Amethyst Block", texture: "minecraft:amethyst_block" },
  { blockName: "White Wool", texture: "minecraft:white_wool" },
  { blockName: "Crying Obsidian", texture: "minecraft:crying_obsidian" },
  { blockName: "Barrier Block", texture: "minecraft:barrier" },
];

/**
 * name: name of the structure to display
 * file: file name to load
 */
const structures = [
  {
    name: "default",
    file: "mystructure:default",
  },
];

const clutchStrength = {
  0: {
    texture: "minecraft:gray_stained_glass",
    name: "§7None",
  },
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

export { getInvData, locationData, tempData, structures, blocks, clutchStrength };
