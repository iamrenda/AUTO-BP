import MinecraftID from "./minecraftID";

type ItemInfo = {
  item: MinecraftID.MinecraftIDUnion;
  quantity: number;
  slot?: number;
  name?: string;
};

export default ItemInfo;
