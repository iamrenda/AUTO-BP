import * as mc from "@minecraft/server";
import * as exp from "../utilities/utilities";
import * as data from "../utilities/staticData";
import * as lobby from "../games/lobby";
import * as bridger from "../games/bridger";
import * as clutcher from "../games/clutcher";
import tempData from "utilities/tempData";
const eatGhead = (player) => {
    player.addEffect("minecraft:regeneration", 100, { amplifier: 4 });
    player.addEffect("minecraft:absorption", 2400, { amplifier: 1 });
    player.addEffect("minecraft:speed", 320, { amplifier: 2 });
    player.playSound("random.burp");
    exp.confirmMessage(player, "§2You ate a §6Golden Head §2and gained 5 seconds of regeneration IIII and 2 minutes of Absorption!");
    exp.confirmMessage(player, "§2You also gained 16 seconds of Speed II!");
    const container = player.getComponent("inventory").container;
    const slot = player.selectedSlotIndex;
    container.setItem(slot, undefined);
};
mc.world.afterEvents.itemUse.subscribe(({ itemStack: item, source: player }) => {
    if (item.typeId === "auto:ghead")
        eatGhead(player);
    switch (tempData.gameID) {
        case "lobby":
            if (item.typeId === "minecraft:compass")
                lobby.nagivatorFormHandler(player);
            if (item.typeId === "minecraft:stick")
                lobby.launchingHandler(player);
            if (item.typeId === "minecraft:book")
                lobby.creditFormHandler(player);
            break;
        case "straightBridger":
        case "inclinedBridger":
            if (item.typeId === "minecraft:book")
                bridger.bridgerFormHandler(player);
            break;
        case "clutcher":
            if (item.typeId === "minecraft:book")
                clutcher.clutcherFormHandler(player);
            break;
    }
});
mc.world.afterEvents.playerPlaceBlock.subscribe(({ block }) => {
    switch (tempData.gameID) {
        case "straightBridger":
        case "inclinedBridger":
            bridger.placingBlockEvt(block);
            break;
        case "clutcher":
            clutcher.placingBlockEvt(block);
            break;
    }
});
mc.world.afterEvents.pressurePlatePush.subscribe(() => {
    switch (tempData.gameID) {
        case "straightBridger":
        case "inclinedBridger":
            bridger.pressurePlatePushEvt();
            break;
    }
});
mc.world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent("auto:clear", {
        onTick({ block }) {
            mc.world.getDimension("overworld").setBlockType(block.location, "minecraft:air");
        },
    });
});
mc.world.afterEvents.playerSpawn.subscribe(({ player }) => {
    exp.teleportation(player, data.locationData.lobby);
    exp.giveItems(player, data.getInvData("lobby"));
    exp.lobbyScoreboardDisplay(player);
});
mc.world.beforeEvents.chatSend.subscribe((event) => {
    const { message, sender: player } = event;
    if (message.includes("AUTO!")) {
        event.cancel = true;
        mc.system.run(() => {
            exp.confirmMessage(player, "§aHaha, thanks for playing this world. This is a present for you!");
            exp.confirmMessage(player, "§aYou have §63 Golden Heads§a in your inventory!", "random.totem");
            const container = player.getComponent("inventory").container;
            for (let i = 1; i <= 3; i++)
                container.addItem(new mc.ItemStack("auto:ghead", 1));
        });
        return;
    }
});
mc.world.beforeEvents.playerBreakBlock.subscribe((e) => (e.cancel = true));
mc.system.runInterval(() => {
    switch (tempData.gameID) {
        case "straightBridger":
        case "inclinedBridger":
            bridger.listener();
            break;
        case "clutcher":
            clutcher.listener();
            break;
    }
});
mc.system.runInterval(() => {
    switch (tempData.gameID) {
        case "clutcher":
            clutcher.slowListener();
            break;
    }
}, 10);
