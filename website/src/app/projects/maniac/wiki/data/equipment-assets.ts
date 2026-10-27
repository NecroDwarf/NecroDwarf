import icon0 from "../../assets/wiki/equipment/agent-armor.png";
import icon1 from "../../assets/wiki/equipment/pudge-armor.png";
import icon2 from "../../assets/wiki/equipment/death-armor.png";
import icon3 from "../../assets/wiki/equipment/ursa-armor.png";
import icon4 from "../../assets/wiki/equipment/plague-armor.png";
import icon5 from "../../assets/wiki/equipment/ghost-armor.png";
import icon6 from "../../assets/wiki/equipment/freddy-armor.png";
import icon7 from "../../assets/wiki/equipment/agent-knife.png";
import icon8 from "../../assets/wiki/equipment/brewing-stand.png";
import icon9 from "../../assets/wiki/equipment/ghost-hand.png";
import icon10 from "../../assets/wiki/equipment/toy-knife.png";
import type { EntityAsset } from "./types";
export const equipmentAssets: Record<string, EntityAsset> = {
  "agent-armor": {
    src: icon0,
    width: 16,
    height: 16,
    kind: "pixel-texture",
    entityId: "item:agent-armor",
  },
  "pudge-armor": {
    src: icon1,
    width: 16,
    height: 16,
    kind: "pixel-texture",
    entityId: "item:pudge-armor",
  },
  "death-armor": {
    src: icon2,
    width: 16,
    height: 16,
    kind: "pixel-texture",
    entityId: "item:death-armor",
  },
  "ursa-armor": {
    src: icon3,
    width: 16,
    height: 16,
    kind: "pixel-texture",
    entityId: "item:ursa-armor",
  },
  "plague-armor": {
    src: icon4,
    width: 16,
    height: 16,
    kind: "pixel-texture",
    entityId: "item:plague-armor",
  },
  "ghost-armor": {
    src: icon5,
    width: 16,
    height: 16,
    kind: "pixel-texture",
    entityId: "item:ghost-armor",
  },
  "freddy-armor": {
    src: icon6,
    width: 16,
    height: 16,
    kind: "pixel-texture",
    entityId: "item:freddy-armor",
  },
  "agent-knife": {
    src: icon7,
    width: 16,
    height: 16,
    kind: "pixel-texture",
    entityId: "item:agent-knife",
  },
  "brewing-stand": {
    src: icon8,
    width: 16,
    height: 16,
    kind: "pixel-texture",
    entityId: "item:brewing-stand",
  },
  "ghost-hand": {
    src: icon9,
    width: 128,
    height: 128,
    kind: "pixel-texture",
    entityId: "item:ghost-hand",
  },
  "toy-knife": {
    src: icon10,
    width: 113,
    height: 128,
    kind: "pixel-texture",
    entityId: "item:toy-knife",
  },
};
