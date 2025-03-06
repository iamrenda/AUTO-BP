import * as util from "./utilities";
import { VERSION } from "../data/staticData";
import { generalTs, clutcherTs } from "../data/tempStorage";
import { BaseGameData } from "../data/dynamicProperty";

export const lobbyScoreboard = function (): string {
  const { player } = generalTs.commonData;
  return `       §a§lAUTO World       §r
 §7${util.today}§r §8Version ${VERSION}§r
    
  §6Ign: §f${player.nameTag}
  §6Gamemodes:
    §fBridger
    §fClutcher
    §fWallrun
    §fBedwars Rush
    §fFist Reduce
    §fParkour
    §fWool Parkour

§eautoworldmc.netlify.app`;
};

export const bridgerScoreboard = function (): string {
  const { player, ticks, blocks } = generalTs.commonData;
  const subCategory = util.getCurrentSubCategory();
  const pbTicks = BaseGameData.getData("Bridger", subCategory, "pbTicks");

  return `       §a§lAUTO World       §r
 §7${util.today}§r §8Version ${VERSION}§r
    
  §6Ign: §f${player.nameTag}
  §6Mode: §f${util.toProperName(subCategory)}
    
  §6Personal Best: §f${util.tickToSec(pbTicks)}
  §6Current Time: §f${util.tickToSec(ticks)}
    
  §6Blocks: §f${blocks}
  
§eautoworldmc.netlify.app`;
};

export const clutcherScoreboard = function (): string {
  const { player } = generalTs.commonData;
  const { distance, clutchHits, hitIndex } = clutcherTs.tempData;

  return `       §a§lAUTO World       §r
 §7${util.today}§r §8Version ${VERSION}§r
  
  §6Ign: §f${player.nameTag}
  §6Hits: §f${clutchHits.length}
  
  §6Distance: §f${distance}
  §6Current Hit: §f${hitIndex}/${clutchHits.length}
  
§eautoworldmc.netlify.app`;
};

export const wallRunScoreboard = function (): string {
  const { player, ticks, blocks } = generalTs.commonData;
  const progress = Math.max(0, +(((player.location.z - 30016) / 105) * 100).toFixed(0));
  const subCategory = util.getCurrentSubCategory();
  const pbTicks = BaseGameData.getData("Wall_Run", subCategory, "pbTicks");

  return `       §a§lAUTO World       §r
 §7${util.today}§r §8Version ${VERSION}§r
  
  §6Ign: §f${player.nameTag}
  §6Map: §f${util.toProperName(subCategory)}
  
  §6Personal Best: §f${util.tickToSec(pbTicks)}
  §6Current Time: §f${util.tickToSec(ticks)}
  
  §6Blocks: §f${blocks}
  §6Progress: §f${progress}%

§eautoworldmc.netlify.app`;
};

export const bedwarsRushScoreboard = function (): string {
  const { ticks, blocks, player } = generalTs.commonData;
  const subCategory = util.getCurrentSubCategory();
  const pbTicks = BaseGameData.getData("Bedwars_Rush", subCategory, "pbTicks");
  return `       §a§lAUTO World       §r
 §7${util.today}§r §8Version ${VERSION}§r
  
  §6Ign: §f${player.nameTag}
  §6Map: §f${util.toProperName(subCategory)}
  
  §6Personal Best: §f${util.tickToSec(pbTicks)}
  §6Current Time: §f${util.tickToSec(ticks)}
  
  §6Blocks: §f${blocks}
  
§eautoworldmc.netlify.app`;
};

export const fistReduceScoreboard = function (): string {
  const { player } = generalTs.commonData;
  const subCategory = util.getCurrentSubCategory();
  const mode = util.toProperName(subCategory);

  return `       §a§lAUTO World       §r
 §7${util.today}§r §8Version ${VERSION}§r
  
  §6Ign: §f${player.nameTag}
  §6Reduce Mode: §f${mode}
  
§eautoworldmc.netlify.app`;
};

export const parkourScoreboard = function (): string {
  const { ticks, player } = generalTs.commonData;
  const subCategory = util.getCurrentSubCategory();
  const pbTicks = BaseGameData.getData("Parkour", subCategory, "pbTicks");
  const chapterName = util.toProperName(subCategory);

  return `       §a§lAUTO World       §r
 §7${util.today}§r §8Version ${VERSION}§r
  
  §6Ign: §f${player.nameTag}
  §6Chapter: §f${chapterName}
  
  §6Personal Best: §f${util.tickToSec(pbTicks)}
  §6Current Time: §f${util.tickToSec(ticks)}
  
§eautoworldmc.netlify.app`;
};

export const woolParkourScoreboard = function (): string {
  const { ticks, player, blocks } = generalTs.commonData;
  const subCategory = util.getCurrentSubCategory();
  const pbTicks = BaseGameData.getData("Wool_Parkour", subCategory, "pbTicks");

  return `       §a§lAUTO World       §r
 §7${util.today}§r §8Version ${VERSION}§r
  
  §6Ign: §f${player.nameTag}
  §6Course: §f${util.toProperName(subCategory)}
  
  §6Personal Best: §f${util.tickToSec(pbTicks)}
  §6Current Time: §f${util.tickToSec(ticks)}
  
  §6Blocks: §f${blocks}

§eautoworldmc.netlify.app`;
};
