import * as mc from "@minecraft/server";
import * as type from "../models/TempStorage";
import { BridgerTypesID, ParkourChapterID } from "../models/DynamicProperty";

const commonDataInstance: type.CommonData = {
  player: mc.world.getAllPlayers()[0],
  gameID: "lobby",
  storedLocations: new Set(),
  storedLocationsGameID: undefined,
  blocks: 0,
  timer: undefined,
  ticks: 0,
};

export class TempStorage<T = any> {
  public name: string;
  public commonData: type.CommonData;
  public tempData: T;

  constructor(name: string, commonData: type.CommonData) {
    this.name = name;
    this.commonData = commonData;
  }

  public setDefaultTempData(): T {
    return {} as T;
  }

  public clearBlocks(): void {
    if (!this.commonData["storedLocations"].size) return;
    [...this.commonData["storedLocations"]].map((location) =>
      mc.world.getDimension("overworld").setBlockType(location, "minecraft:air")
    );
    this.commonData["storedLocations"] = new Set();
  }

  public startTimer(): void {
    this.commonData["ticks"] = 0;
    this.commonData["timer"] = mc.system.runInterval(() => this.commonData["timer"] && this.commonData["ticks"]++);
  }

  public stopTimer(): void {
    if (!this.commonData["timer"]) return;
    mc.system.clearRun(this.commonData["timer"]);
    this.commonData["timer"] = null;
  }
}

class Bridger extends TempStorage<type.BridgerTempStorage> {
  constructor(commonData: type.CommonData) {
    super("Bridger", commonData);
    this.tempData = this.setDefaultTempData();
  }

  public setDefaultTempData(): type.BridgerTempStorage {
    return {
      blockBridger: "minecraft:sandstone",
      bridgerMode: BridgerTypesID.straight16blocks,
      bridgerDirection: "straight",
      isPlateDisabled: false,
    };
  }
}

class Clutcher extends TempStorage<type.ClutcherTempStorage> {
  constructor(commonData: type.CommonData) {
    super("Clutcher", commonData);
    this.tempData = this.setDefaultTempData();
  }

  public setDefaultTempData(): type.ClutcherTempStorage {
    return {
      clutchHits: [1],
      clutchShiftStart: true,

      isListening: false,
      distance: 0,
      startLocation: null,
      endLocation: null,

      countDown: null,
      hitTimer: null,
      sec: 3,
      hitIndex: 0,

      teleportationIndex: 1,
    };
  }

  public stopCountDown(): void {
    if (!this.tempData["countDown"]) return;
    mc.system.clearRun(this.tempData["countDown"]);
    this.tempData["countDown"] = null;
  }
}

class WallRun extends TempStorage<type.WallRunTempStorage> {
  constructor(commonData: type.CommonData) {
    super("WallRunner", commonData);
    this.tempData = this.setDefaultTempData();
  }

  public setDefaultTempData(): type.WallRunTempStorage {
    return {
      wallRunIsCheckPointEnabled: true,

      isPlateDisabled: {
        first: false,
        checkpoint: false,
        goal: false,
      },
      isCheckPointSaved: false,
    };
  }
}

class BedwarsRush extends TempStorage {
  constructor(commonData: type.CommonData) {
    super("BedwarsRush", commonData);
    this.tempData = this.setDefaultTempData();
  }

  public setDefaultTempData() {
    return {};
  }
}

class FistReduce extends TempStorage<type.FistReduceTempStorage> {
  constructor(commonData: type.CommonData) {
    super("FistReduce", commonData);
    this.tempData = this.setDefaultTempData();
  }

  public setDefaultTempData(): type.FistReduceTempStorage {
    return {
      gameModeStatus: "Starting",
      hitCount: 0,
      numHits: "Single",
    };
  }
}

class Parkour extends TempStorage<type.ParkourTempStorage> {
  constructor(commonData: type.CommonData) {
    super("Parkour", commonData);
    this.tempData = this.setDefaultTempData();
  }

  public setDefaultTempData(): type.ParkourTempStorage {
    return {
      chapter: ParkourChapterID.chapter1_1,
      isPlateDisabled: {
        start: false,
        end: false,
      },
      autoReq: undefined,
    };
  }
}

export const generalTs = new TempStorage("general", commonDataInstance);
export const bridgerTs = new Bridger(commonDataInstance);
export const clutcherTs = new Clutcher(commonDataInstance);
export const wallRunTs = new WallRun(commonDataInstance);
export const bedwarsRushTs = new BedwarsRush(commonDataInstance);
export const fistReduceTs = new FistReduce(commonDataInstance);
export const parkourTs = new Parkour(commonDataInstance);
