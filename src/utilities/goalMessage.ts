import * as util from "./utilities";
import { VERSION } from "../data/staticData";
import { bridgerTs } from "../data/tempStorage";
import { BaseGameData, gameData } from "../data/dynamicProperty";

export const bridgerMessage = function (isPB: boolean, time: number, prevPB: number): string {
  const direction = bridgerTs.tempData["bridgerDirection"];
  const distance = gameData.getData(`Bridger${direction}Distance`);
  const pb = BaseGameData.getData("Bridger", util.getCurrentSubCategory(), "pbTicks");

  const difference =
    pb !== -1 ? "§f(" + (isPB ? util.differenceMs(prevPB, time) : util.differenceMs(pb, time)) + "§f)" : "";

  const baseMessage = `
§7----------------------------§r 
    §bBridger§r §8§o- Version ${VERSION}§r
  
    §6Distance:§r §f${distance} Blocks
    §6${isPB ? "Your Previous Best" : "Your Personal Best"}:§r §f${util.tickToSec(isPB ? prevPB : pb)}§f
    §6Time Recorded:§r §f${util.tickToSec(time)}§r ${difference}§r`;

  const pbMessage = isPB ? `    §d§lNEW PERSONAL BEST!!§r` : "";
  return `${baseMessage}\n${pbMessage}\n§7----------------------------`;
};

export const wallRunMessage = function (isPB: boolean, time: number, prevPB: number): string {
  const subCategory = util.getCurrentSubCategory();
  const pb = BaseGameData.getData("Wall_Run", subCategory, "pbTicks");
  const difference =
    pb !== -1 ? "§f(" + (isPB ? util.differenceMs(prevPB, time) : util.differenceMs(pb, time)) + "§f)" : "";

  const baseMessage = `
§7----------------------------§r 
    §bWall Run§r §8§o- Version ${VERSION}§r
  
    §6${isPB ? "Your Previous Best" : "Your Personal Best"}:§r §f${util.tickToSec(isPB ? prevPB : pb)}§f
    §6Time Recorded:§r §f${util.tickToSec(time)}§r ${difference}§r`;

  const pbMessage = isPB ? `    §d§lNEW PERSONAL BEST!!§r\n` : "";
  return `${baseMessage}\n${pbMessage}§7----------------------------`;
};

export const bedwarsRushMessage = function (isPB: boolean, time: number, prevPB: number): string {
  const subCategory = util.getCurrentSubCategory();
  const pb = BaseGameData.getData("Bedwars_Rush", subCategory, "pbTicks");
  const difference =
    pb !== -1 ? "§f(" + (isPB ? util.differenceMs(prevPB, time) : util.differenceMs(pb, time)) + "§f)" : "";

  const baseMessage = `
§7----------------------------§r 
    §bWall Run§r §8§o- Version ${VERSION}§r
  
    §6${isPB ? "Your Previous Best" : "Your Personal Best"}:§r §f${util.tickToSec(isPB ? prevPB : pb)}§f
    §6Time Recorded:§r §f${util.tickToSec(time)}§r ${difference}§r`;

  const pbMessage = isPB ? `    §d§lNEW PERSONAL BEST!!§r\n` : "";
  return `${baseMessage}\n${pbMessage}§7----------------------------`;
};

export const parkourMessage = function (isPB: boolean, time: number, prevPB: number): string {
  const subCategory = util.getCurrentSubCategory();
  const pb = BaseGameData.getData("Parkour", subCategory, "pbTicks");

  const difference =
    prevPB !== -1 ? "§f(" + (isPB ? util.differenceMs(prevPB, time) : util.differenceMs(pb, time)) + "§f)" : "";
  const chapterName = util.toProperName(subCategory);

  const baseMessage = `
§7----------------------------§r 
    §bParkour ${chapterName}§r §8§o- Version ${VERSION}§r
  
    §6${isPB ? "Your Previous Best" : "Your Personal Best"}:§r §f${util.tickToSec(isPB ? prevPB : pb)}§f
    §6Time Recorded:§r §f${util.tickToSec(time)}§r ${difference}§r`;

  const pbMessage = isPB ? `    §d§lNEW PERSONAL BEST!!§r\n` : "";
  return `${baseMessage}\n${pbMessage}§7----------------------------`;
};
