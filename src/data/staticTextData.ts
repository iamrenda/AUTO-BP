import * as util from "../utilities/utilities";
import { VERSION } from "./staticData";
import { bridgerTs, clutcherTs, generalTs, wallRunTs } from "./tempStorage";
import { BedwarsRushData, BridgerData, WallRunData } from "./dynamicProperty";
import { GameData } from "./dynamicProperty";
import { DynamicPropertyID } from "../models/DynamicProperty";

export const lobbyScoreboard = function (): string {
  const nameTag = generalTs.commonData["player"].nameTag;
  return `      §b§lAUTO World§r
§7-------------------§r
 §7- §6Username:§r
   ${nameTag}
    
 §7- §6Game Available:§r
   Bridger
   Clutcher
   Wallrun
   Bedwars Rush
             
 §7- §6Discord:§r
   .gg/4NRYhCYykk
§7-------------------§r
 §8§oVersion ${VERSION} | ${util.today}`;
};

export const bridgerScoreboard = function (): string {
  const pb = BridgerData.getData(DynamicPropertyID.Bridger_PB);
  return `      §b§lAUTO World§r
§7-------------------§r
 §7- §6Personal Best:§r
   ${util.properTimeText(pb)}
    
 §7- §6Time:§r
   ${util.tickToSec(bridgerTs.commonData["ticks"])}
    
 §7- §6Blocks:§r
   ${bridgerTs.commonData["blocks"]}
§7-------------------§r
 §8§oVersion ${VERSION} | ${util.today}`;
};

export const clutcherScoreboard = function (): string {
  return `      §b§lAUTO World§r
§7-------------------§r
 §7- §6Distance:§r
   ${clutcherTs.tempData["distance"]} blocks
    
 §7- §6Hits:§r
   ${clutcherTs.tempData["hitIndex"]}/${clutcherTs.tempData["clutchHits"].length}
§7-------------------§r
 §8§oVersion ${VERSION} | ${util.today}`;
};

export const wallRunScoreboard = function (): string {
  const player = wallRunTs.commonData["player"];
  const progress = Math.max(0, +(((player.location.z - 30016) / 105) * 100).toFixed(0));
  const pb = WallRunData.getData(DynamicPropertyID.WallRunner_PB);
  return `     §b§lAUTO World§r
§7-------------------§r
 §7- §6Personal Best:§r
   §f${util.properTimeText(pb)}

 §7- §6Time:§r
   §f${util.tickToSec(wallRunTs.commonData["ticks"])}

 §7- §6Progress:§r
   §f${progress}%
§7-------------------§r
 §8§oVersion ${VERSION} | ${util.today}`;
};

export const bedwarsRushScoreboard = function (): string {
  const pb = BedwarsRushData.getData(DynamicPropertyID.BedwarsRush_PB);
  return `      §b§lAUTO World§r
§7-------------------§r
 §7- §6Personal Best:§r
   ${util.properTimeText(pb)}
    
 §7- §6Time:§r
   ${util.tickToSec(bridgerTs.commonData["ticks"])}
    
 §7- §6Blocks:§r
   ${bridgerTs.commonData["blocks"]}
§7-------------------§r
 §8§oVersion ${VERSION} | ${util.today}`;
};

export const bridgerMessage = function (isPB: boolean, time: number, prevPB: number): string {
  const distance = GameData.getData("Distance");
  const pb = BridgerData.getData(DynamicPropertyID.Bridger_PB);
  const difference =
    pb !== -1
      ? "§f(" + (isPB ? util.differenceMs(prevPB, time) : util.differenceMs(pb, time)) + "§f)"
      : "";

  const baseMessage = `
§7----------------------------§r 
    §bBridger§r §8§o- Version ${VERSION}§r
  
    §6Distance:§r §f${distance} Blocks
    §6${isPB ? "Your Previous Best" : "Your Personal Best"}:§r §f${util.properTimeText(
    isPB ? prevPB : pb
  )}§f
    §6Time Recorded:§r §f${util.tickToSec(time)}§r ${difference}§r`;

  const pbMessage = isPB ? `  §d§lNEW PERSONAL BEST!!§r\n` : "";
  return `${baseMessage}\n${pbMessage}§7----------------------------`;
};

export const wallRunMessage = function (isPB: boolean, time: number, prevPB: number): string {
  const pb = WallRunData.getData(DynamicPropertyID.WallRunner_PB);
  const difference =
    pb !== -1
      ? "§f(" + (isPB ? util.differenceMs(prevPB, time) : util.differenceMs(pb, time)) + "§f)"
      : "";

  const baseMessage = `
§7----------------------------§r 
    §bWall Run§r §8§o- Version ${VERSION}§r
  
    §6${isPB ? "Your Previous Best" : "Your Personal Best"}:§r §f${util.properTimeText(
    isPB ? prevPB : pb
  )}§f
    §6Time Recorded:§r §f${util.tickToSec(time)}§r ${difference}§r`;

  const pbMessage = isPB ? `  §d§lNEW PERSONAL BEST!!§r\n` : "";
  return `${baseMessage}\n${pbMessage}§7----------------------------`;
};
