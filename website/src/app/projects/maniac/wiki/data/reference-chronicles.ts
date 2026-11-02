import { releases } from "../../changelogs/registry";
import type { Entity, EntityId } from "./types";

// Curated Reforge mentions without numeric release snapshots.
const reforgePerks = new Set<EntityId>([
  "perk:ejection",
  "perk:family-discord",
  "perk:griefer",
  "perk:silence",
  "perk:independence",
  "perk:altruist-exe",
  "perk:magic-lover",
  "perk:dutch-helm",
  "perk:idealych",
  "perk:mental-bond",
  "perk:football-fan",
  "perk:hedgehog-skin",
  "perk:mana-break",
  "perk:bigmoney",
  "perk:fear-wave",
  "perk:megamind",
  "perk:gto-medal",
  "perk:computer-breaker",
  "perk:blindness",
  "perk:i-am-speed",
  "perk:last-breath",
  "perk:mimic",
  "perk:quick-reflexes",
  "perk:wallhack",
  "perk:catch-mistakes",
]);

/** Keep the latest documented release on reference articles, as before. */
export function referenceChronicles(entity: Entity<"perk" | "ability">) {
  const documented = releases
    .filter(
      (release) =>
        release.status === "published" &&
        (entity.revisions[`release:${release.version}`] ||
          (entity.kind === "perk" &&
            reforgePerks.has(entity.id) &&
            release.version === "1.0")),
    )
    .sort((a, b) => b.releaseOrder - a.releaseOrder)
    .slice(0, 1);
  return documented.map((release) => {
    if (!release.href) throw new Error(`Missing chronicle URL: ${release.id}`);
    return {
      version: release.version,
      title: release.title,
      href: release.href,
    };
  });
}
