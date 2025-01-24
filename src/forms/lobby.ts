import { Player } from "@minecraft/server";
import { ActionFormData, ActionFormResponse } from "@minecraft/server-ui";
import { VERSION } from "../data/staticData";
import ChestFormData from "../formExtensions/forms";

export const lobbyForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("36")
    .title("Lobby Selector")
    .pattern(["_________", "__a_b_c__", "___d_s____", "_________"], {
      a: {
        itemName: "§6§lBridger",
        itemDesc: [
          "§7Practice bridging across the",
          "§7other island as fast as you can!",
          "",
          "§eClick to Play!",
        ],
        texture: "minecraft:sandstone",
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
      c: {
        itemName: "§6§lWall Run",
        itemDesc: [
          "§7Place blocks quickly along the",
          "§7wall to reach the goal as fast",
          "§7as you can!",
          "",
          "§eClick to Play!",
        ],
        texture: "minecraft:mud_brick_wall",
        stackAmount: 1,
        enchanted: false,
      },
      d: {
        itemName: "§6§lBedwars Rush",
        itemDesc: [
          "§7Race to place blocks and",
          "§7bridge to the end island quickly!",
          "",
          "§eClick to Play!",
        ],
        texture: "minecraft:bed",
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

export const formBridgerDirForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("9").title("Direction").pattern(["__s___i__"], {
    s: {
      itemName: "§6Straight",
      itemDesc: [],
      texture: "minecraft:chain",
      stackAmount: 1,
      enchanted: false,
    },
    i: {
      itemName: "§6Inclined",
      itemDesc: [],
      texture: "minecraft:arrow",
      stackAmount: 1,
      enchanted: false,
    },
  });

  return await form.show(player);
};

export const lobbyCreditForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ActionFormData()
    .title("Credits")
    .body(
      `§3§lAUTO World§r §8- Version ${VERSION}§r
 
 §b§oContributors:§r
   §7- §6Developer: §fTheMinerCat
   §7- §6Builder: §fqwertyguy
   §7- §6Helper: §fbartnielot
   
 §b§oPersonal thank you to:§r
   §7- §6Chest UI: §fHerobrine643928
   §7- §6Personal Scoreboard: §fPMK / Nodu
   §7- §6Bridger Map: §fBrody Bigwood
   §7- §6Bedwars Rush Map: §fBdoggy617
  
`
    )
    .button("Close");

  return await form.show(player);
};
