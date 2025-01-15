import * as mc from "@minecraft/server";

type WallRunner = {
  ticks: number;
  storedLocations: Set<mc.Vector3>;
  isCheckPointEnabled: boolean;
  isCheckPointSaved: boolean;
};

const wallRunner: WallRunner = {
  ticks: 0,
  storedLocation: new Set(),
  isCheckPointEnabled: true,
  isCheckPointSaved: false,
};

export const pressurePlatePushEvt = function () {};
