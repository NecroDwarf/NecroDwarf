import reforge from "./1.0.json";
import nightmare from "./1.1.json";
import flower from "./1.2.json";
import type { ChronicleContent, ChronicleNode } from "./types";
export const chronicleContent = {
  "1.0": reforge,
  "1.1": nightmare,
  "1.2": flower,
} as Record<string, ChronicleContent>;
export const nodeText = (node: ChronicleNode): string =>
  typeof node === "string" ? node : node.children.map(nodeText).join("");
export function cardTitle(node: ChronicleNode) {
  if (typeof node === "string") return "";
  const heading = node.children.find(
    (n) => typeof n !== "string" && n.tag === "h3",
  );
  if (!heading || typeof heading === "string") return "";
  return heading.children
    .filter((n) => typeof n === "string" || n.role !== "badge")
    .map(nodeText)
    .join("")
    .trim();
}
