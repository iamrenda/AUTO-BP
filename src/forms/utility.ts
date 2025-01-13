import { Player } from "@minecraft/server";
import { ActionFormResponse } from "@minecraft/server-ui";
import ChestFormData from "../formExtensions/forms";
import { DynamicPropertyID } from "../models/DynamicProperty";
import DynamicProperty from "../utilities/dynamicProperty";

const confirmationForm = async function (player: Player): Promise<ActionFormResponse> {
  const currentDistance = DynamicProperty.getDynamicBridgerData(DynamicPropertyID.GameDatas, "Distance");
  const form = new ChestFormData("27")
    .title(`§4§lReset PB for ${currentDistance} Blocks`)
    .pattern(["_________", "__n___y__", "_________"], {
      n: {
        itemName: "§7Cancel",
        itemDesc: [],
        texture: "minecraft:gray_wool",
        stackAmount: 1,
        enchanted: false,
      },
      y: {
        itemName: "§l§4Reset",
        itemDesc: [],
        texture: "minecraft:red_wool",
        stackAmount: 1,
        enchanted: false,
      },
    });
  return await form.show(player);
};

export { confirmationForm };
