import ChestFormData from "../formExtensions/forms";
import dynamicProperty from "utilities/dynamicProperty";
import { GameDataID } from "models/DynamicProperty";
const confirmationForm = async function (player) {
    const form = new ChestFormData("27")
        .title(`§4§lReset PB for ${dynamicProperty.getGameData(GameDataID.straightDistance)} Blocks`)
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
