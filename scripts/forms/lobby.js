import { ActionFormData } from "@minecraft/server-ui";
import ChestFormData from "../formExtensions/forms";
const lobbyForm = async function (player) {
    const form = new ChestFormData("9").title("Lobby Selector").pattern(["_a_b___s_"], {
        a: {
            itemName: "§6§lBridger",
            itemDesc: ["§7Practice bridging across the", "§7other island as fast as you can!", "", "§eClick to Play!"],
            texture: "minecraft:ladder",
            stackAmount: 1,
            enchanted: false,
        },
        b: {
            itemName: "§6§lClutcher",
            itemDesc: [
                "§7Click fast as you can to make a",
                "§7clutch against multiple hits",
                "§7from an opponent!",
                "",
                "§eClick to Play!",
            ],
            texture: "minecraft:slime",
            stackAmount: 1,
            enchanted: false,
        },
        s: {
            itemName: "§7Back to Lobby",
            itemDesc: [],
            texture: "minecraft:mob_spawner",
            stackAmount: 1,
            enchanted: false,
        },
    });
    return await form.show(player);
};
const lobbyCreditForm = async function (player) {
    const form = new ActionFormData()
        .title("Credits")
        .body("§3§lAUTO World§r §o§8- Version 4§r\n\n§b§oContributors:§r\n  §7-§r §6Developer:§r §fTheMinerCat§r\n  §7-§r §6Builder:§r §fqwertyguy§r\n\n§b§oPersonal thank you to:§r\n  §7-§r §6Chest UI:§r §fHerobrine643928§r\n  §7-§r §6Personal Scoreboard:§r §fPMK / Nodu§r\n\n")
        .button("Close");
    return await form.show(player);
};
export { lobbyForm, lobbyCreditForm };
