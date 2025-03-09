import MinecraftID from "./minecraftID";
import { Vector3 } from "@minecraft/server";

export type ItemInfo = {
  item: MinecraftID.MinecraftIDUnion;
  quantity: number;
  slot?: number;
  name?: string;
};

export type TeleportationLocation = {
  position: Vector3;
  facing: Vector3;
};

export type BreakingAnimation = "Falling Domino" | "Falling" | "Domino" | "None";

export type ReduceBotStatus = "Starting" | "Running" | "Paused";

export type ReduceBotHits = "Single" | "Double" | "Triple";
