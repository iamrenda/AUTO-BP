import { Player } from "@minecraft/server";
import { fistReduceForm } from "../forms/fistReduce";
import * as util from "../utilities/utilities";

export const fistReduceFormHandler = async function (player: Player) {
  const { selection } = await fistReduceForm(player);

  // back to lobby
  if (selection === 15) util.backToLobbyKit(player);
};
