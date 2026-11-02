import type { NavigationItem } from "../shared/content/navigation";
import { projects } from "./registry";
import { maniacNavigation } from "./maniac/navigation";

const sections: Readonly<Record<string, readonly NavigationItem[]>> = {
  maniac: maniacNavigation,
};
export const projectNavigation: readonly NavigationItem[] = projects.map(
  (project) => ({
    label: project.name,
    href: `/projects/${project.id}`,
    children: sections[project.id],
  }),
);
