import type { EntityAsset, EntityId } from "./types";
import { entityAssets } from "./assets";
import { equipmentAssets } from "./equipment-assets";
import { files } from "../../assets/wiki/restored/imports.json";

const restoredUrls = import.meta.glob<string>(
  "../../assets/wiki/restored/*.png",
  { eager: true, query: "?url", import: "default" },
);
const restored: Readonly<Record<string, EntityAsset>> = Object.fromEntries(
  files.map((file) => [
    file.slug,
    {
      src: restoredUrls[`../../assets/wiki/restored/${file.slug}.png`],
      width: file.width,
      height: file.height,
      kind: file.kind as EntityAsset["kind"],
      entityId: `item:${file.slug}` as EntityId,
      presentation:
        file.slug === "death-scythe" ? { brightness: 1.7 } : undefined,
    },
  ]),
);
const mechanicUrls = import.meta.glob<string>(
  "../../assets/wiki/mechanics/*.svg",
  { eager: true, query: "?url", import: "default" },
);
export const mechanicIconAssets: Readonly<Record<string, EntityAsset>> =
  Object.fromEntries(
    Object.entries(mechanicUrls).map(([path, src]) => {
      const slug = path
        .split("/")
        .at(-1)!
        .replace(/\.svg$/, "");
      return [
        slug,
        {
          src,
          width: 64,
          height: 64,
          kind: "illustration",
          entityId: `mechanic:${slug}` as EntityId,
        },
      ];
    }),
  );

/** Shared asset resolution for catalog cards, article headers and entity cards. */
export function systemIconAsset(
  id: EntityId<"item" | "mechanic">,
  icon?: string,
): EntityAsset | undefined {
  const slug = id.slice(id.indexOf(":") + 1);
  return (
    (icon ? entityAssets[icon] : undefined) ??
    equipmentAssets[slug] ??
    restored[slug] ??
    mechanicIconAssets[slug]
  );
}
