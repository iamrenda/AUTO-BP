import { world } from "@minecraft/server";

world.afterEvents.itemUse.subscribe(({ itemStack: item, source: player }) => {
  if (item.typeId !== "minecraft:barrier") return;
});
