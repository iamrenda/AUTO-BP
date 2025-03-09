import * as mc from "@minecraft/server";
import { fistReduceForm } from "../forms/fistReduce";
import * as util from "../utilities/utilities";
import { fistReduceTs } from "../data/tempStorage";
import { ReduceBotHits, ReduceBotStatus } from "../models/general";

const GAME_STATUS: Record<string, ReduceBotStatus> = {
  STARTING: "Starting",
  RUNNING: "Running",
  PAUSED: "Paused",
};

const HIT_TYPES: ReduceBotHits[] = ["Single", "Double", "Triple"];

// applying knockback to player from knockback
const applyKnockback = function (
  player: mc.Player,
  { viewX, viewZ }: { viewX: number; viewZ: number },
  horizontalKb: number
) {
  const verticalKb = 0.55;

  player.applyKnockback(-viewX, -viewZ, horizontalKb, verticalKb);
  player.playSound("game.player.hurt");
};

// teleports the bot
const teleportBot = function (mode: "normal" | "limitless") {
  const bot = ReducerBot.bot;
  mode === "normal"
    ? bot.teleport({ x: 50008.5, y: 102, z: 50052.5 }, { facingLocation: { x: 50008.5, y: 102, z: 50052 } })
    : bot.teleport({ x: 50008.5, y: 320, z: 50052.5 }, { facingLocation: { x: 50008.5, y: 320, z: 50052 } });
};

const handleGameModeStatus = function () {
  switch (fistReduceTs.tempData["reduceBotStatus"]) {
    case GAME_STATUS.STARTING:
      ReducerBot.defineBot();
      teleportBot(fistReduceTs.commonData["gameID"] === "Fist_Reduce$Normal" ? "normal" : "limitless");
      ReducerBot.bot.triggerEvent("auto:reduce");
      fistReduceTs.tempData["reduceBotStatus"] = GAME_STATUS.RUNNING;
      break;

    case GAME_STATUS.RUNNING:
      fistReduceTs.tempData["reduceBotStatus"] = GAME_STATUS.PAUSED;
      ReducerBot.bot.triggerEvent("auto:pause");
      util.sendMessage("§6Bot is now paused!", "random.glass");
      break;

    case GAME_STATUS.PAUSED:
      fistReduceTs.tempData["reduceBotStatus"] = GAME_STATUS.RUNNING;
      ReducerBot.bot.triggerEvent("auto:reduce");
      util.sendMessage("§2Bot is now resumed!", "random.glass");
      break;
  }
};

const cycleNumHits = function () {
  const currentHits = fistReduceTs.tempData["reduceBotHits"];
  const nextHits = HIT_TYPES[(HIT_TYPES.indexOf(currentHits) + 1) % HIT_TYPES.length];
  fistReduceTs.tempData["reduceBotHits"] = nextHits;
};

// reducer bot class
class ReducerBot {
  static bot: mc.Entity;

  constructor() {}

  public static defineBot() {
    ReducerBot.bot = mc.world.getDimension("overworld").getEntities({ type: "auto:reducerbot" })[0];
  }
}

export const fistReduceFormHandler = async function (player: mc.Player) {
  const { selection } = await fistReduceForm(player);

  switch (selection) {
    // gamemode status
    case 10:
      return handleGameModeStatus();

    // num hits
    case 13:
      cycleNumHits();
      player.playSound("random.orb");
      break;

    //back to lobby
    case 16:
      fistReduceTs.clearBlocks();
      ReducerBot.bot.triggerEvent("auto:pause");
      util.backToLobbyKit(player, fistReduceTs);
      break;
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
    const { reduceBotHits: numHits } = fistReduceTs.tempData;

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
    util.giveItems("Fist_Reduce");
    util.sendMessage("", "random.pop");
    fistReduceTs.tempData["hitCount"] = 0;

    if (gameID === "Fist_Reduce$Normal") {
      util.teleportation("Fist_Reduce$Normal");
      teleportBot("normal");
    } else {
      util.teleportation("Fist_Reduce$LIMITLESS");
      teleportBot("limitless");
    }
  } else gameID === "Fist_Reduce$Normal" ? teleportBot("normal") : teleportBot("limitless");
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
