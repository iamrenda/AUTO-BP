import "./eventListener/eventListener";
import * as mc from "@minecraft/server";
import { DynamicProperty } from "./data/dynamicProperty";
DynamicProperty.fetchData();
mc.world.afterEvents.chatSend.subscribe(() => {
    DynamicProperty.resetDynamicData();
    mc.world.sendMessage(`${mc.world.getDynamicProperty("auto:dynamicData")}`);
});
