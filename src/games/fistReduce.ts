import * as mc from "@minecraft/server";
import { fistReduceForm } from "../forms/fistReduce";
import * as util from "../utilities/utilities";
import { fistReduceTs } from "../data/tempStorage";
import { locationData } from "../data/staticData";

/**
 * applying knockback to player from knockback
 */
const applyKnockback = function (
  player: mc.Player,
  { viewX, viewZ }: { viewX: number; viewZ: number },
  horizontalKb: number
) {
  const verticalKb = 0.55;

  player.applyKnockback(-viewX, -viewZ, horizontalKb, verticalKb);
  player.playSound("game.player.hurt");
};

/**
 * teleports the bot
 */
const teleportBot = function (mode: "normal" | "limitless") {
  const bot = ReducerBot.bot;
  mode === "normal"
    ? bot.teleport({ x: 50008.5, y: 102, z: 50052.5 }, { facingLocation: { x: 50008.5, y: 102, z: 50052 } })
    : bot.teleport({ x: 50008.5, y: 320, z: 50052.5 }, { facingLocation: { x: 50008.5, y: 320, z: 50052 } });
};

/**
 * reducer bot class
 */
class ReducerBot {
  static bot: mc.Entity;

  constructor() {}

  public static defineBot() {
    ReducerBot.bot = mc.world.getDimension("overworld").getEntities({ type: "auto:reducerbot" })[0];
  }
}

export const fistReduceFormHandler = async function (player: mc.Player) {
  const { selection } = await fistReduceForm(player);

  // gamemode status
  if (selection === 10) {
    switch (fistReduceTs.tempData["gameModeStatus"]) {
      // about to start
      case "Starting":
        ReducerBot.defineBot();
        fistReduceTs.commonData["gameID"] === "normalFistReduce" ? teleportBot("normal") : teleportBot("limitless");
        ReducerBot.bot.triggerEvent("auto:reduce");
        fistReduceTs.tempData["gameModeStatus"] = "Running";
        break;

      // about to pause
      case "Running":
        fistReduceTs.tempData["gameModeStatus"] = "Paused";
        ReducerBot.bot.triggerEvent("auto:pause");
        util.sendMessage("§6Bot is now paused!", "random.glass");
        break;

      // about to continue
      case "Paused":
        fistReduceTs.tempData["gameModeStatus"] = "Running";
        ReducerBot.bot.triggerEvent("auto:reduce");
        util.sendMessage("§2Bot is now resumed!", "random.glass");
        break;
    }
  }

  // num hits
  if (selection === 13) {
    if (fistReduceTs.tempData["numHits"] === "Single") {
      fistReduceTs.tempData["numHits"] = "Double";
    } else if (fistReduceTs.tempData["numHits"] === "Double") {
      fistReduceTs.tempData["numHits"] = "Triple";
    } else if (fistReduceTs.tempData["numHits"] === "Triple") {
      fistReduceTs.tempData["numHits"] = "Single";
    }
    fistReduceFormHandler(player);

    util.sendMessage("", "random.orb");
  }

  // back to lobby
  if (selection === 16) {
    fistReduceTs.clearBlocks();
    ReducerBot.bot.triggerEvent("auto:pause");
    util.backToLobbyKit(player, fistReduceTs);
  }
};

export const fistReduceAttackEvt = function (hurtEntity: mc.Entity, damageSource: mc.EntityDamageSource) {
  if (!damageSource.damagingEntity || damageSource.cause === "entityExplosion") return;
  const attackerLocation = damageSource.damagingEntity.location;
  const hurtEntityLocation = hurtEntity.location;
  const deltaX = hurtEntityLocation.x - attackerLocation.x;
  const deltaZ = hurtEntityLocation.z - attackerLocation.z;
  const distance = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);
  const unitX = deltaX / distance;
  const unitZ = deltaZ / distance;

  // when player hits bot
  if (hurtEntity.typeId !== "minecraft:player") {
    const player = fistReduceTs.commonData["player"];
    const { numHits } = fistReduceTs.tempData;

    fistReduceTs.tempData["hitCount"]++;

    if (fistReduceTs.tempData["hitCount"] === 2) {
      hurtEntity.clearVelocity();
      hurtEntity.applyImpulse({
        x: -(unitX / 13),
        y: 0.35,
        z: -(unitZ / 13),
      });

      mc.system.runTimeout(() => {
        const { x: viewX, z: viewZ } = player.getViewDirection();
        applyKnockback(player, { viewX, viewZ }, 2.75);

        if (numHits === "Double") mc.system.runTimeout(() => applyKnockback(player, { viewX, viewZ }, 2.75), 10);
        if (numHits === "Triple") {
          mc.system.runTimeout(() => applyKnockback(player, { viewX, viewZ }, 2.75), 10);
          mc.system.runTimeout(() => applyKnockback(player, { viewX, viewZ }, 2.75), 20);
        }
        fistReduceTs.tempData["hitCount"] = 0;
      }, 12);
    } else {
      hurtEntity.clearVelocity();
      hurtEntity.applyImpulse({
        x: unitX / 9,
        y: 0.35,
        z: unitZ / 9,
      });
    }
  }
};

export const placingBlockEvt = function ({ location }: { location: mc.Vector3 }) {
  fistReduceTs.commonData["storedLocations"].add(location);
  mc.system.runTimeout(() => {
    try {
      mc.world.getDimension("overworld").setBlockType(location, "auto:custom_redstoneBlock");
      fistReduceTs.commonData["storedLocations"].delete(location);
    } catch (e) {}
  }, 100);
};

const resetMap = function (whoDied: "player" | "bot") {
  const gameID = fistReduceTs.commonData["gameID"];

  if (whoDied === "player") {
    util.giveItems("normalFistReduce");
    util.sendMessage("", "random.pop");
    fistReduceTs.tempData["hitCount"] = 0;

    if (gameID === "normalFistReduce") {
      util.teleportation(locationData.normalFistReduce);
      teleportBot("normal");
    } else {
      util.teleportation(locationData.limitlessFistReduce);
      teleportBot("limitless");
    }
  } else gameID === "normalFistReduce" ? teleportBot("normal") : teleportBot("limitless");
};

export const slowListener = function (mode: "normal" | "limitless") {
  const playerY = fistReduceTs.commonData["player"].location.y;
  const botY = ReducerBot.bot?.location?.y;

  if (mode === "normal") {
    if (playerY < 95) resetMap("player");
    if (botY < 95) resetMap("bot");
  } else {
    if (playerY < 312) resetMap("player");
    if (botY < 312) resetMap("bot");
  }
};
