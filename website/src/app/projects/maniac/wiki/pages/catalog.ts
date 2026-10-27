import { characters } from "../data/characters";
import { verifiedSource } from "../data/snapshots";
const images = import.meta.glob<string>("../../assets/characters/*-card.webp", {
  eager: true,
  query: "?url",
  import: "default",
});
export const characterEntries = characters.map((entity) => {
  const data = entity.revisions[verifiedSource]!.data;
  return {
    ...entity,
    data,
    href: `/projects/maniac/wiki/characters/${entity.slug}`,
    fresco: images[`../../assets/characters/${data.gameId}-card.webp`],
  };
});
export const roleLabel = (role: string) =>
  role === "maniac" ? "Маньяк" : "Выживший";
