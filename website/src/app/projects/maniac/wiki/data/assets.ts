import concentrated from "../../assets/wiki/concentrated-nightmare.webp";
import lighter from "../../assets/wiki/nightmare-lighter.png";
import forgetPerk from "../../assets/wiki/forget-me-not-perk.webp";
import forgetItem from "../../assets/wiki/forget-me-not-item.png";

export const entityAssets: Readonly<
  Record<
    string,
    {
      src: string;
      width: number;
      height: number;
      pixelated: boolean;
      entityId: string;
    }
  >
> = {
  "concentrated-nightmare": {
    src: concentrated,
    width: 256,
    height: 171,
    pixelated: false,
    entityId: "ability:concentrated-nightmare",
  },
  "nightmare-lighter": {
    src: lighter,
    width: 64,
    height: 32,
    pixelated: true,
    entityId: "item:nightmare-lighter",
  },
  "forget-me-not-perk": {
    src: forgetPerk,
    width: 256,
    height: 256,
    pixelated: false,
    entityId: "perk:forget-me-not",
  },
  "forget-me-not-item": {
    src: forgetItem,
    width: 32,
    height: 32,
    pixelated: true,
    entityId: "item:forget-me-not",
  },
};
