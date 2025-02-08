import * as util from "../utilities/utilities";
import { VERSION } from "./staticData";
import { BridgerData, WallRunData } from "./dynamicProperty";
import { DynamicPropertyID } from "../models/DynamicProperty";
import { generalTs, bridgerTs, wallRunTs, clutcherTs, fistReduceTs } from "./tempStorage";
import { BedwarsRushData } from "./dynamicProperty";

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
   Fist Reduce
             
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
   ${util.tickToSec(pb)}
    
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
   §f${util.tickToSec(pb)}

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
   ${util.tickToSec(pb)}
    
 §7- §6Time:§r
   ${util.tickToSec(bridgerTs.commonData["ticks"])}
    
 §7- §6Blocks:§r
   ${bridgerTs.commonData["blocks"]}
§7-------------------§r
 §8§oVersion ${VERSION} | ${util.today}`;
};

export const fistReduceScoreboard = function (): string {
  const mode = fistReduceTs.commonData["gameID"] === "normalFistReduce" ? "Normal Reduce" : "LIMITLESS";

  return `      §b§lAUTO World§r
§7-------------------§r
 §7- §6Reduce Mode:§r
   ${mode}
             
 §7- §6Discord§r
   .gg/4NRYhCYykk
§7-------------------§r
 §8§oVersion ${VERSION} | ${util.today}`;
};
