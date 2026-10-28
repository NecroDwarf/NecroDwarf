import icon0 from "../../assets/wiki/abilities/smoke-cloud.webp";
import icon1 from "../../assets/wiki/abilities/quantum-swap.webp";
import icon2 from "../../assets/wiki/abilities/hook-throw.webp";
import icon3 from "../../assets/wiki/abilities/death-teleport.webp";
import icon4 from "../../assets/wiki/abilities/beast-leap.webp";
import icon5 from "../../assets/wiki/abilities/plague-orb.webp";
import icon6 from "../../assets/wiki/abilities/phantom-veil.webp";
import icon7 from "../../assets/wiki/abilities/damage-transfer.webp";
import icon8 from "../../assets/wiki/abilities/musical-wave.webp";
import type { EntityAsset } from "./types";
export const characterAbilityAssets: Record<string, EntityAsset> = {
  "smoke-cloud": {
    src: icon0,
    width: 256,
    height: 256,
    kind: "illustration",
    entityId: "ability:smoke-cloud",
  },
  "quantum-swap": {
    src: icon1,
    width: 256,
    height: 256,
    kind: "illustration",
    entityId: "ability:quantum-swap",
  },
  "hook-throw": {
    src: icon2,
    width: 256,
    height: 244,
    kind: "illustration",
    entityId: "ability:hook-throw",
  },
  "death-teleport": {
    src: icon3,
    width: 171,
    height: 256,
    kind: "illustration",
    entityId: "ability:death-teleport",
  },
  "beast-leap": {
    src: icon4,
    width: 128,
    height: 128,
    kind: "illustration",
    entityId: "ability:beast-leap",
  },
  "plague-orb": {
    src: icon5,
    width: 256,
    height: 255,
    kind: "illustration",
    entityId: "ability:plague-orb",
  },
  "phantom-veil": {
    src: icon6,
    width: 128,
    height: 128,
    kind: "illustration",
    entityId: "ability:phantom-veil",
  },
  "damage-transfer": {
    src: icon7,
    width: 48,
    height: 48,
    kind: "illustration",
    entityId: "ability:damage-transfer",
  },
  "musical-wave": {
    src: icon8,
    width: 256,
    height: 256,
    kind: "illustration",
    entityId: "ability:musical-wave",
  },
};
