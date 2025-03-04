import "./eventListener/eventListener";
import * as mc from "@minecraft/server";
import { getCurrentSubCategory } from "./utilities/utilities";
import { DynamicProperty } from "./data/dynamicProperty";
mc.world.afterEvents.chatSend.subscribe(() => {
    DynamicProperty.resetDynamicData();
    mc.world.sendMessage(`${getCurrentSubCategory()}`);
    mc.world.sendMessage(`${mc.world.getDynamicProperty("auto:dynamicData")}`);
});
