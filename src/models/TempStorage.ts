import * as mc from "@minecraft/server";
import GameID from "./GameID";
import minecraftID from "./minecraftID";
import { IslandDireciton, IslandDistance, TellyMode } from "./Bridger";

export type CommonData = {
  player: mc.Player;
  gameID: GameID;
  storedLocations: Set<mc.Vector3>;
  storedLocationsGameID: GameID;
  blocks: number;
  timer: number | undefined;
  ticks: number;

  byPass: boolean; // allow bypassing gamemode change
};

export type BridgerTempStorage = {
  blockBridger: minecraftID.MinecraftBlockIdIF;
  bridgerDirection: IslandDireciton;
  bridgerDistance: IslandDistance;
  tellyMode: TellyMode;
  isPlateDisabled: boolean;
};

export type ClutcherTempStorage = {
  clutchHits: number[];
  clutchShiftStart: boolean;

  isListening: boolean;
  distance: number;
  startLocation: mc.Vector3 | null;
  endLocation: mc.Vector3 | null;

  countDown: number | null;
  hitTimer: number | null;
  sec: number;
  hitIndex: number;

  teleportationIndex: number;
};

export type WallRunTempStorage = {
  wallRunIsCheckPointEnabled: boolean;

  isPlateDisabled: {
    first: boolean;
    checkpoint: boolean;
    goal: boolean;
  };
  isCheckPointSaved: boolean;
};

export type FistReduceTempStorage = {
  gameModeStatus: "Starting" | "Running" | "Paused";
  numHits: "Single" | "Double" | "Triple";
  hitCount: number;
};

export type ParkourTempStorage = {
  isPlateDisabled: {
    start: boolean;
    end: boolean;
  };
  autoReq: number;
};
