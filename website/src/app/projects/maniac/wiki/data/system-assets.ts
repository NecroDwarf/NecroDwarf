import image0 from "../../assets/wiki/systems/system-salt.webp";
import image1 from "../../assets/wiki/systems/system-generator.png";
import image2 from "../../assets/wiki/systems/system-hook.png";
import image3 from "../../assets/wiki/systems/system-dead-staff.png";
import image4 from "../../assets/wiki/systems/system-necromancer-helmet.webp";
import image5 from "../../assets/wiki/systems/system-necromancer-chestplate.webp";
import image6 from "../../assets/wiki/systems/system-necromancer-leggings.webp";
import image7 from "../../assets/wiki/systems/system-necromancer-boots.webp";
import image8 from "../../assets/wiki/systems/system-maniac-regen-fragment.webp";
import image9 from "../../assets/wiki/systems/system-maniac-strength-fragment.webp";
import image10 from "../../assets/wiki/systems/system-maniac-speed-fragment.webp";
import image11 from "../../assets/wiki/systems/system-maniac-slowness-fragment.webp";
import image12 from "../../assets/wiki/systems/system-maniac-slow-falling-fragment.webp";
import image13 from "../../assets/wiki/systems/system-maniac-weakness-fragment.webp";
import image14 from "../../assets/wiki/systems/system-maniac-healing-fragment.webp";
import image15 from "../../assets/wiki/systems/system-maniac-blindness-fragment.webp";
import image16 from "../../assets/wiki/systems/system-maniac-glowing-fragment.webp";
import image17 from "../../assets/wiki/systems/system-recipe-book.webp";
import image18 from "../../assets/wiki/systems/system-bandages.png";
import image19 from "../../assets/wiki/systems/system-medical-tablet.png";
import image20 from "../../assets/wiki/systems/system-medical-mask.webp";
import image21 from "../../assets/wiki/systems/system-microphone.png";
import image22 from "../../assets/wiki/systems/system-ghost-hand.webp";
import image23 from "../../assets/wiki/systems/system-beast-claw.png";
import image24 from "../../assets/wiki/systems/system-beehive-food.png";
import image25 from "../../assets/wiki/systems/system-bong.png";
import image26 from "../../assets/wiki/systems/system-adrenaline-syringe.png";
import image27 from "../../assets/wiki/systems/system-ancestor-soul.png";
import image28 from "../../assets/wiki/systems/system-ancestral-totem.png";
import image29 from "../../assets/wiki/systems/system-quantum-teleport.png";
import image30 from "../../assets/wiki/systems/system-coin-elusiveness.webp";
import image31 from "../../assets/wiki/systems/system-coin-insight.webp";
import image32 from "../../assets/wiki/systems/system-coin-shackles.webp";
import image33 from "../../assets/wiki/systems/system-coin-health.webp";
import image34 from "../../assets/wiki/systems/system-coin-eagle.webp";
import image35 from "../../assets/wiki/systems/system-coin-debt.webp";
import image36 from "../../assets/wiki/systems/system-coin-reroll.webp";
import image37 from "../../assets/wiki/systems/system-coin-fate.webp";
import image38 from "../../assets/wiki/systems/system-slot-machine.png";
import image39 from "../../assets/wiki/systems/system-awakening-needle.png";
import image40 from "../../assets/wiki/systems/system-paint-can.webp";
import image41 from "../../assets/wiki/systems/system-forget-me-not.webp";
import image42 from "../../assets/wiki/systems/system-pink-orchid.webp";
import image43 from "../../assets/wiki/systems/system-sber-sprout.webp";
import image44 from "../../assets/wiki/systems/system-guardian-head.webp";
import image45 from "../../assets/wiki/systems/system-red-color-card.webp";
import image46 from "../../assets/wiki/systems/system-blue-color-card.webp";
import image47 from "../../assets/wiki/systems/system-green-color-card.webp";
import image48 from "../../assets/wiki/systems/system-computer.png";
import type { EntityAsset } from "./types";
export const systemAssets: Record<string, EntityAsset> = {
  "system-salt": {
    src: image0,
    width: 320,
    height: 320,
    kind: "pixel-texture",
    entityId: "item:salt",
  },
  "system-generator": {
    src: image1,
    width: 320,
    height: 320,
    kind: "item-render",
    entityId: "item:generator",
  },
  "system-hook": {
    src: image2,
    width: 320,
    height: 320,
    kind: "item-render",
    entityId: "item:hook",
  },
  "system-dead-staff": {
    src: image3,
    width: 320,
    height: 320,
    kind: "item-render",
    entityId: "item:dead-staff",
  },
  "system-necromancer-helmet": {
    src: image4,
    width: 16,
    height: 16,
    kind: "pixel-texture",
    entityId: "item:necromancer-helmet",
  },
  "system-necromancer-chestplate": {
    src: image5,
    width: 16,
    height: 16,
    kind: "pixel-texture",
    entityId: "item:necromancer-chestplate",
  },
  "system-necromancer-leggings": {
    src: image6,
    width: 16,
    height: 16,
    kind: "pixel-texture",
    entityId: "item:necromancer-leggings",
  },
  "system-necromancer-boots": {
    src: image7,
    width: 16,
    height: 16,
    kind: "pixel-texture",
    entityId: "item:necromancer-boots",
  },
  "system-maniac-regen-fragment": {
    src: image8,
    width: 278,
    height: 278,
    kind: "pixel-texture",
    entityId: "item:maniac-regen-fragment",
  },
  "system-maniac-strength-fragment": {
    src: image9,
    width: 278,
    height: 278,
    kind: "pixel-texture",
    entityId: "item:maniac-strength-fragment",
  },
  "system-maniac-speed-fragment": {
    src: image10,
    width: 278,
    height: 278,
    kind: "pixel-texture",
    entityId: "item:maniac-speed-fragment",
  },
  "system-maniac-slowness-fragment": {
    src: image11,
    width: 278,
    height: 278,
    kind: "pixel-texture",
    entityId: "item:maniac-slowness-fragment",
  },
  "system-maniac-slow-falling-fragment": {
    src: image12,
    width: 278,
    height: 278,
    kind: "pixel-texture",
    entityId: "item:maniac-slow-falling-fragment",
  },
  "system-maniac-weakness-fragment": {
    src: image13,
    width: 278,
    height: 278,
    kind: "pixel-texture",
    entityId: "item:maniac-weakness-fragment",
  },
  "system-maniac-healing-fragment": {
    src: image14,
    width: 278,
    height: 278,
    kind: "pixel-texture",
    entityId: "item:maniac-healing-fragment",
  },
  "system-maniac-blindness-fragment": {
    src: image15,
    width: 278,
    height: 278,
    kind: "pixel-texture",
    entityId: "item:maniac-blindness-fragment",
  },
  "system-maniac-glowing-fragment": {
    src: image16,
    width: 278,
    height: 278,
    kind: "pixel-texture",
    entityId: "item:maniac-glowing-fragment",
  },
  "system-recipe-book": {
    src: image17,
    width: 291,
    height: 320,
    kind: "pixel-texture",
    entityId: "item:recipe-book",
  },
  "system-bandages": {
    src: image18,
    width: 320,
    height: 320,
    kind: "item-render",
    entityId: "item:bandages",
  },
  "system-medical-tablet": {
    src: image19,
    width: 320,
    height: 320,
    kind: "item-render",
    entityId: "item:medical-tablet",
  },
  "system-medical-mask": {
    src: image20,
    width: 16,
    height: 16,
    kind: "pixel-texture",
    entityId: "item:medical-mask",
  },
  "system-microphone": {
    src: image21,
    width: 320,
    height: 320,
    kind: "item-render",
    entityId: "item:microphone",
  },
  "system-ghost-hand": {
    src: image22,
    width: 320,
    height: 320,
    kind: "pixel-texture",
    entityId: "item:ghost-hand",
  },
  "system-beast-claw": {
    src: image23,
    width: 320,
    height: 320,
    kind: "item-render",
    entityId: "item:beast-claw",
  },
  "system-beehive-food": {
    src: image24,
    width: 320,
    height: 320,
    kind: "item-render",
    entityId: "item:beehive-food",
  },
  "system-bong": {
    src: image25,
    width: 320,
    height: 320,
    kind: "item-render",
    entityId: "item:bong",
  },
  "system-adrenaline-syringe": {
    src: image26,
    width: 320,
    height: 320,
    kind: "item-render",
    entityId: "item:adrenaline-syringe",
  },
  "system-ancestor-soul": {
    src: image27,
    width: 320,
    height: 320,
    kind: "item-render",
    entityId: "item:ancestor-soul",
  },
  "system-ancestral-totem": {
    src: image28,
    width: 320,
    height: 320,
    kind: "item-render",
    entityId: "item:ancestral-totem",
  },
  "system-quantum-teleport": {
    src: image29,
    width: 320,
    height: 320,
    kind: "item-render",
    entityId: "item:quantum-teleport",
  },
  "system-coin-elusiveness": {
    src: image30,
    width: 320,
    height: 318,
    kind: "pixel-texture",
    entityId: "item:coin-elusiveness",
  },
  "system-coin-insight": {
    src: image31,
    width: 319,
    height: 320,
    kind: "pixel-texture",
    entityId: "item:coin-insight",
  },
  "system-coin-shackles": {
    src: image32,
    width: 320,
    height: 318,
    kind: "pixel-texture",
    entityId: "item:coin-shackles",
  },
  "system-coin-health": {
    src: image33,
    width: 318,
    height: 320,
    kind: "pixel-texture",
    entityId: "item:coin-health",
  },
  "system-coin-eagle": {
    src: image34,
    width: 320,
    height: 318,
    kind: "pixel-texture",
    entityId: "item:coin-eagle",
  },
  "system-coin-debt": {
    src: image35,
    width: 318,
    height: 320,
    kind: "pixel-texture",
    entityId: "item:coin-debt",
  },
  "system-coin-reroll": {
    src: image36,
    width: 320,
    height: 318,
    kind: "pixel-texture",
    entityId: "item:coin-reroll",
  },
  "system-coin-fate": {
    src: image37,
    width: 318,
    height: 320,
    kind: "pixel-texture",
    entityId: "item:coin-fate",
  },
  "system-slot-machine": {
    src: image38,
    width: 320,
    height: 320,
    kind: "item-render",
    entityId: "item:slot-machine",
  },
  "system-awakening-needle": {
    src: image39,
    width: 320,
    height: 320,
    kind: "item-render",
    entityId: "item:awakening-needle",
  },
  "system-paint-can": {
    src: image40,
    width: 32,
    height: 32,
    kind: "pixel-texture",
    entityId: "item:paint-can",
  },
  "system-forget-me-not": {
    src: image41,
    width: 32,
    height: 32,
    kind: "pixel-texture",
    entityId: "item:forget-me-not",
  },
  "system-pink-orchid": {
    src: image42,
    width: 32,
    height: 32,
    kind: "pixel-texture",
    entityId: "item:pink-orchid",
  },
  "system-sber-sprout": {
    src: image43,
    width: 32,
    height: 32,
    kind: "pixel-texture",
    entityId: "item:sber-sprout",
  },
  "system-guardian-head": {
    src: image44,
    width: 16,
    height: 16,
    kind: "pixel-texture",
    entityId: "item:guardian-head",
  },
  "system-red-color-card": {
    src: image45,
    width: 32,
    height: 32,
    kind: "pixel-texture",
    entityId: "item:red-color-card",
  },
  "system-blue-color-card": {
    src: image46,
    width: 32,
    height: 32,
    kind: "pixel-texture",
    entityId: "item:blue-color-card",
  },
  "system-green-color-card": {
    src: image47,
    width: 32,
    height: 32,
    kind: "pixel-texture",
    entityId: "item:green-color-card",
  },
  "system-computer": {
    src: image48,
    width: 320,
    height: 320,
    kind: "item-render",
    entityId: "item:computer",
  },
};
