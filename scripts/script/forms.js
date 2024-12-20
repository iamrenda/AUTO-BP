import ChestFormData from "../extensions/forms.js";
import { ActionFormData } from "@minecraft/server-ui";
import { tempData, blocks } from "./data.js";
import dynamicProperty from "./dynamicProperty.js";

const lobbyForm = async function (player) {
  const form = new ChestFormData("9").title("Lobby Selector").pattern(["_a_b___s_"], {
    a: {
      itemName: "§6§lBridger",
      itemDesc: ["§7Practice bridging across the", "§7other island as fast as you can!", "", "§eClick to Play!"],
      texture: "minecraft:ladder",
      stackAmount: 1,
      enchanted: false,
    },
    b: {
      itemName: "§6§lClutcher",
      itemDesc: [
        "§7Click fast as you can to make a",
        "§7clutch against multiple hits",
        "§7from an opponent!",
        "",
        "§eClick to Play!",
      ],
      texture: "minecraft:slime",
      stackAmount: 1,
      enchanted: false,
    },
    s: {
      itemName: "§7Back to Lobby",
      itemDesc: [],
      texture: "minecraft:mob_spawner",
      stackAmount: 1,
      enchanted: false,
    },
  });

  return await form.show(player);
};

const lobbyCreditForm = async function (player) {
  const form = new ActionFormData()
    .title("Credits")
    .body(
      "§3§lAUTO World§r §o§8- Version 4§r\n\n§b§oContributors:§r\n  §7-§r §6Developer:§r §fTheMinerCat§r\n  §7-§r §6Builder:§r §fqwertyguy§r\n\n§b§oPersonal thank you to:§r\n  §7-§r §6Chest UI:§r §fHerobrine643928§r\n  §7-§r §6Personal Scoreboard:§r §fPMK / Nodu§r\n\n"
    )
    .button("Close");

  return await form.show(player);
};

const confirmationForm = async function (player) {
  const form = new ChestFormData("27")
    .title(`§4§lReset PB for ${dynamicProperty.getGameData("straightDistance")} Blocks`)
    .pattern(["_________", "__n___y__", "_________"], {
      n: {
        itemName: "§7Cancel",
        itemDesc: [],
        texture: "minecraft:gray_wool",
        stackAmount: 1,
        enchanted: false,
      },
      y: {
        itemName: "§l§4Reset",
        itemDesc: [],
        texture: "minecraft:red_wool",
        stackAmount: 1,
        enchanted: false,
      },
    });
  return await form.show(player);
};

const bridgerBlockForm = async function (player) {
  const form = new ChestFormData("27").title("Block Selection");

  blocks.map(({ blockName, texture }, index) =>
    texture === tempData.block
      ? form.button(index + 9, blockName, ["", "§eSelected"], texture, 1, true)
      : form.button(index + 9, blockName, [], texture, 1, false)
  );
  return await form.show(player);
};

const bridgerForm = async function (player) {
  const form = new ChestFormData("27").title("Settings").pattern(["_________", "_i_b_r_o_", "_________"], {
    i: {
      itemName: "§3General",
      itemDesc: [],
      texture: "minecraft:grass_block",
      stackAmount: 1,
      enchanted: false,
    },
    b: {
      itemName: "§2Blocks",
      itemDesc: [],
      texture: tempData.block,
      stackAmount: 1,
      enchanted: false,
    },
    r: {
      itemName: "§l§4Reset Personal Best",
      itemDesc: [],
      texture: "minecraft:tnt",
      stackAmount: 1,
      enchanted: false,
    },
    o: {
      itemName: "§cQuit",
      itemDesc: [],
      texture: "minecraft:red_dye",
      stackAmount: 1,
      enchanted: false,
    },
  });
  return await form.show(player);
};

const bridgerIslandForm = async function (player) {
  const form = new ChestFormData("45")
    .title("Island Customization")
    .pattern(["_________", "_s_c_____", "_m_f_____", "_l_______", "_________"], {
      s: {
        itemName: "§616 Blocks",
        itemDesc: [],
        texture: "minecraft:sandstone",
        stackAmount: 16,
        enchanted: +dynamicProperty.getGameData("straightDistance") === 16,
      },
      m: {
        itemName: "§621 Blocks",
        itemDesc: [],
        texture: "minecraft:sandstone",
        stackAmount: 21,
        enchanted: +dynamicProperty.getGameData("straightDistance") === 21,
      },
      l: {
        itemName: "§650 Blocks",
        itemDesc: [],
        texture: "minecraft:sandstone",
        stackAmount: 50,
        enchanted: +dynamicProperty.getGameData("straightDistance") === 50,
      },
      c: {
        itemName: "§6StairCased",
        itemDesc: [],
        texture: "minecraft:sandstone_stairs",
        stackAmount: 1,
        enchanted: dynamicProperty.getGameData("straightIsStairCased"),
      },
      f: {
        itemName: "§6Flat",
        itemDesc: [],
        texture: "minecraft:sandstone_slab",
        stackAmount: 1,
        enchanted: !dynamicProperty.getGameData("straightIsStairCased"),
      },
    });
  return await form.show(player);
};

const clutcherForm = async function (player) {
  const form = new ChestFormData("27").title("Clutcher Selector").pattern(["_________", "_r_s_b_q_", "_________"], {
    r: {
      itemName: "§aStart",
      itemDesc: [],
      texture: "minecraft:green_dye",
      stackAmount: 1,
      enchanted: false,
    },
    s: {
      itemName: "§dSettings",
      itemDesc: [],
      texture: "minecraft:repeater",
      stackAmount: 1,
      enchanted: false,
    },
    b: {
      itemName: "§2Blocks",
      itemDesc: [],
      texture: "minecraft:sandstone", // CHECK change block
      stackAmount: 1,
      enchanted: false,
    },
    q: {
      itemName: "§cQuit",
      itemDesc: [],
      texture: "minecraft:red_dye",
      stackAmount: 1,
      enchanted: false,
    },
  });

  return form.show(player);
};

const clutchNumForm = async function (player) {
  const form = new ChestFormData("27").title("Clutcher Hit Setting");
  for (let i = 0; i <= 8; i++) form.button(i + 9, `${i + 1} Hits`, [], "minecraft:blaze_rod", i + 1, false);
  return form.show(player);
};

const clutchSettingsForm = function () {
  return new ChestFormData("27").title("Clutch Settings");
};

export {
  lobbyForm,
  lobbyCreditForm,
  confirmationForm,
  bridgerIslandForm,
  bridgerForm,
  bridgerBlockForm,
  clutcherForm,
  clutchNumForm,
  clutchSettingsForm,
};
