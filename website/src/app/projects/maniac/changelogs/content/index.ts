import type { ChronicleNode } from "./types";
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
