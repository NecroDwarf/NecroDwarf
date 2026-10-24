import type { Project } from "../shared/content/types";
import { meta as maniac } from "./maniac/meta";
import { meta as friendsheep } from "./friendsheep/meta";
import { meta as novellmaker } from "./novellmaker/meta";
import { releases } from "./maniac/changelogs/registry";
import { ManiacPage } from "./maniac/pages/ManiacPage";
import { FriendSheepPage } from "./friendsheep/pages/FriendSheepPage";
import { NovellMakerPage } from "./novellmaker/pages/NovellMakerPage";
export const projects: readonly Project[] = [
  { ...maniac, releases, Page: ManiacPage },
  { ...friendsheep, releases: [], Page: FriendSheepPage },
  { ...novellmaker, releases: [], Page: NovellMakerPage },
];
export const projectNames = Object.fromEntries(
  projects.map((p) => [p.id, p.name]),
);
// Dates determine order across projects when known. Undated histories stay in a
// separate stable group: releaseOrder is local to a project, not a fake date.
export const publishedReleases = projects
  .flatMap((p) => p.releases)
  .filter((r) => r.status === "published")
  .sort((a, b) => {
    if (a.publishedAt && b.publishedAt)
      return b.publishedAt.localeCompare(a.publishedAt);
    if (a.publishedAt) return -1;
    if (b.publishedAt) return 1;
    return (
      a.projectId.localeCompare(b.projectId) || b.releaseOrder - a.releaseOrder
    );
  });
