import { world } from "@minecraft/server";
import { locationData, setGameId, getGameId } from "../script/export.js";
import { lobbyMenu } from "../script/forms.js";

// CHECK
// world.afterEvents.playerSpawn.subscribe((player) =>
//   player.teleport(locationData.lobby.position, {
//     facingLocation: locationData.lobby.facing,
//   })
// );
world.beforeEvents.playerLeave.subscribe(() => setGameId === "lobby");

world.afterEvents.itemUse.subscribe(({ itemStack: item, source: player }) => {
  // if (getGameId !== "lobby") return; CHECK

  switch (item.typeId) {
    case "minecraft:compass": // lobby
      lobbyMenu(player);
      break;
  }
});
