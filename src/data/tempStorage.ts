import * as mc from "@minecraft/server";
import { BridgerTicksID } from "../models/DynamicProperty";
import GameID from "../models/GameID";
import minecraftID from "../models/minecraftID";

/////////////////////////////////////////////////////
type CommonData = {
  player: mc.Player;
  gameID: GameID;
  storedLocations: Set<mc.Vector3>;
  storedLocationsGameID: GameID;
  blocks: number;
  timer: number | undefined;
  ticks: number;
};

type BridgerTempStorage = {
  blockBridger: minecraftID.MinecraftBlockIdIF;
  bridgerMode: BridgerTicksID;
  bridgerDirection: "straight" | "inclined";
  isPlateDisabled: boolean;
  autoReq?: number;
};

type ClutcherTempStorage = {
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

type WallRunTempStorage = {
  wallRunIsCheckPointEnabled: boolean;
  autoReq: number | undefined;

  isPlateDisabled: {
    first: boolean;
    checkpoint: boolean;
    goal: boolean;
  };
  isCheckPointSaved: boolean;
};
/////////////////////////////////////////////////////

class TempStorage<T = any> {
  public name: string;
  public commonData: CommonData;
  public tempData: T;

  constructor(name: string, commonData: CommonData) {
    this.name = name;
    this.commonData = commonData;
  }

  protected setDefaultTempData(): T {
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
    this.commonData["timer"] = mc.system.runInterval(
      () => this.commonData["timer"] && this.commonData["ticks"]++
    );
  }

  public stopTimer(): void {
    if (!this.commonData["timer"]) return;
    mc.system.clearRun(this.commonData["timer"]);
    this.commonData["timer"] = null;
  }
}

class Bridger extends TempStorage<BridgerTempStorage> {
  constructor(commonData: CommonData) {
    super("Bridger", commonData);
    this.tempData = this.setDefaultTempData();
  }

  protected setDefaultTempData(): BridgerTempStorage {
    return {
      blockBridger: "minecraft:sandstone",
      bridgerMode: BridgerTicksID.straight16blocks,
      bridgerDirection: "straight",
      isPlateDisabled: false,
      autoReq: undefined,
    };
  }
}

class Clutcher extends TempStorage<ClutcherTempStorage> {
  constructor(commonData: CommonData) {
    super("Clutcher", commonData);
    this.tempData = this.setDefaultTempData();
  }

  protected setDefaultTempData(): ClutcherTempStorage {
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

class WallRun extends TempStorage<WallRunTempStorage> {
  constructor(commonData: CommonData) {
    super("WallRunner", commonData);
    this.tempData = this.setDefaultTempData();
  }

  protected setDefaultTempData(): WallRunTempStorage {
    return {
      wallRunIsCheckPointEnabled: true,
      autoReq: undefined,

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
  constructor(commonData: CommonData) {
    super("BedwarsRush", commonData);
    this.tempData = this.setDefaultTempData();
  }

  protected setDefaultTempData() {
    return {};
  }
}

const commonDataInstance: CommonData = {
  player: mc.world.getAllPlayers()[0],
  gameID: "lobby",
  storedLocations: new Set(),
  storedLocationsGameID: undefined,
  blocks: 0,
  timer: undefined,
  ticks: 0,
};

const generalTs = new TempStorage("general", commonDataInstance);
const bridgerTs = new Bridger(commonDataInstance);
const clutcherTs = new Clutcher(commonDataInstance);
const wallRunTs = new WallRun(commonDataInstance);
const bedwarsRushTs = new BedwarsRush(commonDataInstance);

export { generalTs, bridgerTs, wallRunTs, clutcherTs, bedwarsRushTs };
