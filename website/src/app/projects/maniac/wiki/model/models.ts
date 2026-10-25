import keeper from "../../assets/models/keeper/keeper.glb?url";
import type { CharacterModel } from "./types";
export const characterModels: Readonly<Record<string, CharacterModel>> = {
  "keeper-nightmares": {
    id: "keeper-nightmares",
    src: keeper,
    label: "Хранитель кошмаров",
    cameraDirection: [0.8, 0.25, -1],
    animationSupport: "static",
  },
};
