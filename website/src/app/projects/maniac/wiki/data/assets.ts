import concentrated from "../../assets/wiki/concentrated-nightmare.webp";
import lighter from "../../assets/wiki/nightmare-lighter-render.png";
import forgetPerk from "../../assets/wiki/forget-me-not-perk.webp";
import forgetItem from "../../assets/wiki/forget-me-not-item.png";

import type { EntityAsset } from "./types";
import { flowerAssets } from "./flower-assets";
import { characterAbilityAssets } from "./character-ability-assets";
import { registeredPerkAssets } from "./registered-perk-assets";
import { ghostAbilityAsset } from "./ghost-ability-asset";

export const entityAssets: Readonly<Record<string, EntityAsset>> = {
  ...flowerAssets,
  ...characterAbilityAssets,
  ...registeredPerkAssets,
  "ghost-possession": ghostAbilityAsset,
  "concentrated-nightmare": {
    src: concentrated,
    width: 256,
    height: 256,
    kind: "illustration",
    entityId: "ability:concentrated-nightmare",
  },
  "nightmare-lighter": {
    src: lighter,
    width: 512,
    height: 512,
    kind: "item-render",
    entityId: "item:nightmare-lighter",
  },
  "forget-me-not-perk": {
    src: forgetPerk,
    width: 256,
    height: 256,
    kind: "illustration",
    presentation: { blend: "screen" },
    entityId: "perk:forget-me-not",
  },
  "forget-me-not-item": {
    src: forgetItem,
    width: 32,
    height: 32,
    kind: "pixel-texture",
    entityId: "item:forget-me-not",
  },
};
