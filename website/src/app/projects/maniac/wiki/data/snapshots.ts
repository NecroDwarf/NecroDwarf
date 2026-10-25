import type { SnapshotId } from "./types";
const commit8692f66 = "8692f66dc76582144be85d553d43a41f189b64e7";
export const verifiedSource = "source:8692f66" satisfies SnapshotId;
export const snapshots = {
  "release:1.0": {
    label: "Хроники 1.0",
    kind: "release",
    commit: commit8692f66,
  },
  "release:1.1": {
    label: "Хроники 1.1",
    kind: "release",
    commit: commit8692f66,
  },
  "release:1.2": {
    label: "Хроники 1.2",
    kind: "release",
    commit: commit8692f66,
  },
  "source:8692f66": {
    label: "Проверенные исходники · 8692f66",
    kind: "source",
    commit: commit8692f66,
  },
} as const;
export const sourceCommit = snapshots[verifiedSource].commit;
export function sourceUrl(path: string, snapshot: SnapshotId) {
  const record = snapshots[snapshot as keyof typeof snapshots];
  if (!record) return undefined;
  return `https://github.com/doflare123/Maniac-mod-evolution/blob/${record.commit}/${path}`;
}
