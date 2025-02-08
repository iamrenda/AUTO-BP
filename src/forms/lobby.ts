import { Player } from "@minecraft/server";
import { ActionFormData, ActionFormResponse } from "@minecraft/server-ui";
import { VERSION } from "../data/staticData";
import ChestFormData from "../formExtensions/forms";
import { BaseGameData } from "../data/dynamicProperty";
import { getBridgerMode, setBridgerMode, tickToSec } from "../utilities/utilities";
import { BridgerTicksID } from "../models/DynamicProperty";

const statsText = function (
  gamemode: string,
  pb: number,
  avgTime: number,
  attempts: number,
  successAttempts: number
): string {
  const successFailRatio = (successAttempts / attempts).toFixed(2);

  return `
§bStats for ${gamemode}§r
 §7- §6Personal Best: §f${tickToSec(pb)}
 §7- §6Average Time: §f${tickToSec(avgTime)}

 §7- §6Attempts: §f${attempts}
 §7- §6Successful Attempts: §f${successAttempts}
 §7- §6Success / Fail Attempts Ratio: §f${successFailRatio}
 
 `;
};

export const lobbyForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("36")
    .title("Lobby Selector")
    .button(
      11,
      "§6§lBridger",
      ["§7Practice bridging across the", "§7other island as fast as you can!", "", "§eClick to Play!"],
      "minecraft:sandstone",
      1,
      false
    )
    .button(
      13,
      "§6§lClutcher",
      [
        "§7Click fast as you can to make a",
        "§7clutch against multiple hits",
        "§7from an opponent!",
        "",
        "§eClick to Play!",
      ],
      "minecraft:slime",
      1,
      false
    )
    .button(
      15,
      "§6§lWall Run",
      ["§7Place blocks quickly along the", "§7wall to reach the goal as fast", "§7as you can!", "", "§eClick to Play!"],
      "minecraft:mud_brick_wall",
      1,
      false
    )
    .button(
      21,
      "§6§lBedwars Rush",
      ["§7Race to place blocks and", "§7bridge to the end island quickly!", "", "§eClick to Play!"],
      "minecraft:bed",
      1,
      false
    )
    .button(
      23,
      "§6§lFist Reduce",
      ["§7Reduce with fist and", "§7clutch by placing the blocks!", "", "§eClick to Play!"],
      "minecraft:totem_of_undying",
      1,
      false
    );

  return await form.show(player);
};

export const formBridgerDirForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27")
    .title("Direction")
    .button(11, "§6Straight", [], "minecraft:chain", 1, false)
    .button(15, "§6Inclined", [], "minecraft:arrow", 1, false);

  return await form.show(player);
};

export const fistReduceModeForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27")
    .title("Direction")
    .button(11, "§6Normal", [], "minecraft:mace", 1, false)
    .button(15, "§6LIMITLESS", [], "minecraft:elytra", 1, false);

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
   §7- §6Fist Reduce Map: §fPlatzangst
  
`
    )
    .button("Close");

  return await form.show(player);
};

export const lobbyStatsGamemodeForm = async function (player: Player): Promise<ActionFormResponse> {
  const form = new ChestFormData("27")
    .title("Gamemode selector")
    .button(11, "§6§lBridger", [], "minecraft:sandstone", 1, false)
    .button(13, "§6§lWall Run", [], "minecraft:mud_brick_wall", 1, false)
    .button(15, "§6§lBedWars Rush", [], "minecraft:bed", 1, false);

  return await form.show(player);
};

export const lobbyStatsForm = async function (
  player: Player,
  baseGameDataClass: typeof BaseGameData,
  gameId: "Bridger" | "WallRunner" | "BedwarsRush"
): Promise<ActionFormResponse> {
  let cumulatedText = "";
  if (gameId === "Bridger") {
    for (const bridgerMode in BridgerTicksID) {
      setBridgerMode(BridgerTicksID[bridgerMode as keyof typeof BridgerTicksID]);
      const { pb, avgTime, attempts, successAttempts } = baseGameDataClass.getBundledData("Bridger");

      let parts = getBridgerMode().split(/(\d+)/);
      parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();

      cumulatedText += statsText(parts.join(" ").trim(), pb, avgTime, attempts, successAttempts);
    }
  } else {
    const { pb, avgTime, attempts, successAttempts } = baseGameDataClass.getBundledData(gameId);

    cumulatedText += statsText(gameId, pb, avgTime, attempts, successAttempts);
  }

  const form = new ActionFormData()
    .title(`${player.nameTag}'s Stats`)
    .body(
      `§3§lAUTO World§r §8- Version ${VERSION}§r

${cumulatedText}
§7§oThank you for playing AUTO World!
`
    )
    .button("Close");

  return await form.show(player);
};
