import "./eventListener/eventListener";
import * as mc from "@minecraft/server";
mc.world.afterEvents.chatSend.subscribe(() => {
    mc.world.sendMessage("message detected");
    mc.world.sendMessage(`${mc.world.structureManager.getWorldStructureIds()[0]}`);
    mc.world.sendMessage(`${mc.world.structureManager.getWorldStructureIds()[1]}`);
});
