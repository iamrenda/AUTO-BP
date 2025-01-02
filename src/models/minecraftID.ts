import { MinecraftItemTypes, MinecraftBlockTypes } from "@minecraft/vanilla-data";

namespace minecraftID {
  export type MinecraftBlockIdIF = `${MinecraftBlockTypes}`;
  type MinecraftItemIdIF = `${MinecraftItemTypes}`;

  export type MinecraftIDUnion = MinecraftBlockIdIF | MinecraftItemIdIF;
}

export default minecraftID;
