import * as util from "./utilities";
import { VERSION } from "../data/staticData";
import { generalTs, bridgerTs, clutcherTs } from "../data/tempStorage";
import { BaseGameData } from "../data/dynamicProperty";

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
   Parkour
             
 §7- §6Discord:§r
   .gg/4NRYhCYykk
§7-------------------§r
 §8§oVersion ${VERSION} | ${util.today}`;
};

export const bridgerScoreboard = function (): string {
  const subCategory = util.getCurrentSubCategory();
  const pbTicks = BaseGameData.getData("Bridger", subCategory, "pbTicks");

  return `      §b§lAUTO World§r
§7-------------------§r
 §7- §6Personal Best:§r
   ${util.tickToSec(pbTicks)}
    
 §7- §6Time:§r
   ${util.tickToSec(bridgerTs.commonData["ticks"])}
    
 §7- §6Blocks:§r
   ${bridgerTs.commonData["blocks"]}
§7-------------------§r
 §8§oVersion ${VERSION} | ${util.today}`;
};

export const clutcherScoreboard = function (): string {
  const { distance, clutchHits, hitIndex } = clutcherTs.tempData;
  return `      §b§lAUTO World§r
§7-------------------§r
 §7- §6Distance:§r
   ${distance} blocks
    
 §7- §6Hits:§r
   ${hitIndex}/${clutchHits.length}
§7-------------------§r
 §8§oVersion ${VERSION} | ${util.today}`;
};

export const wallRunScoreboard = function (): string {
  const { player, ticks } = generalTs.commonData;
  const progress = Math.max(0, +(((player.location.z - 30016) / 105) * 100).toFixed(0));
  const subCategory = util.getCurrentSubCategory();
  const pbTicks = BaseGameData.getData("Bridger", subCategory, "pbTicks");

  return `     §b§lAUTO World§r
§7-------------------§r
 §7- §6Personal Best:§r
   §f${util.tickToSec(pbTicks)}

 §7- §6Time:§r
   §f${util.tickToSec(ticks)}

 §7- §6Progress:§r
   §f${progress}%
§7-------------------§r
 §8§oVersion ${VERSION} | ${util.today}`;
};

export const bedwarsRushScoreboard = function (): string {
  const { ticks, blocks } = generalTs.commonData;
  const subCategory = util.getCurrentSubCategory();
  const pbTicks = BaseGameData.getData("Bridger", subCategory, "pbTicks");
  return `      §b§lAUTO World§r
§7-------------------§r
 §7- §6Personal Best:§r
   ${util.tickToSec(pbTicks)}
    
 §7- §6Time:§r
   ${util.tickToSec(ticks)}
    
 §7- §6Blocks:§r
   ${blocks}
§7-------------------§r
 §8§oVersion ${VERSION} | ${util.today}`;
};

export const fistReduceScoreboard = function (): string {
  const subCategory = util.getCurrentSubCategory();
  const mode = util.nameGenerator(subCategory);

  return `      §b§lAUTO World§r
§7-------------------§r
 §7- §6Reduce Mode:§r
   ${mode}
             
 §7- §6Discord§r
   .gg/4NRYhCYykk
§7-------------------§r
 §8§oVersion ${VERSION} | ${util.today}`;
};

export const parkourScoreboard = function (): string {
  const { ticks } = generalTs.commonData;
  const subCategory = util.getCurrentSubCategory();
  const pbTicks = BaseGameData.getData("Parkour", subCategory, "pbTicks");
  const chapterName = util.nameGenerator(subCategory);

  return `      §b§lAUTO World§r
§7-------------------§r
 §7- §6Chapter:§r
   ${chapterName}

 §7- §6Personal Best:§r
   ${util.tickToSec(pbTicks)}
    
 §7- §6Time:§r
   ${util.tickToSec(ticks)}
§7-------------------§r
 §8§oVersion ${VERSION} | ${util.today}`;
};
