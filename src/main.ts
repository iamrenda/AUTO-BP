import "./eventListener/eventListener";

//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
import * as mc from "@minecraft/server";
import { DynamicProperty } from "./data/dynamicProperty";

DynamicProperty.fetchData();
mc.world.afterEvents.chatSend.subscribe(() => {
  DynamicProperty.postData();
  mc.world.sendMessage("posted data");
});
