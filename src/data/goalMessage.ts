import * as util from "../utilities/utilities";
import { VERSION } from "./staticData";
import { BridgerData, WallRunData } from "./dynamicProperty";
import { GameData } from "./dynamicProperty";
import { DynamicPropertyID } from "../models/DynamicProperty";

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

  const pbMessage = isPB ? `    §d§lNEW PERSONAL BEST!!§r\n` : "";
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

  const pbMessage = isPB ? `    §d§lNEW PERSONAL BEST!!§r\n` : "";
  return `${baseMessage}\n${pbMessage}§7----------------------------`;
};
