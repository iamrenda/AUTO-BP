import * as util from "./utilities";
import { VERSION } from "../data/staticData";
import { BridgerData, WallRunData } from "../data/dynamicProperty";
import { GameData } from "../data/dynamicProperty";
import { DynamicPropertyID } from "../models/DynamicProperty";
import { parkourTs } from "../data/tempStorage";

export const bridgerMessage = function (isPB: boolean, time: number, prevPB: number): string {
  const distance = GameData.getData("Distance");
  const pb = BridgerData.getData(DynamicPropertyID.Bridger_PB);
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
  const pb = WallRunData.getData(DynamicPropertyID.WallRunner_PB);
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
  const pb = WallRunData.getData(DynamicPropertyID.WallRunner_PB);

  const difference =
    prevPB !== -1 ? "§f(" + (isPB ? util.differenceMs(prevPB, time) : util.differenceMs(pb, time)) + "§f)" : "";
  const chapter = parkourTs.tempData["chapter"];

  const baseMessage = `
§7----------------------------§r 
    §bParkour ${chapter}§r §8§o- Version ${VERSION}§r
  
    §6${isPB ? "Your Previous Best" : "Your Personal Best"}:§r §f${util.tickToSec(isPB ? prevPB : pb)}§f
    §6Time Recorded:§r §f${util.tickToSec(time)}§r ${difference}§r`;

  const pbMessage = isPB ? `    §d§lNEW PERSONAL BEST!!§r\n` : "";
  return `${baseMessage}\n${pbMessage}§7----------------------------`;
};
