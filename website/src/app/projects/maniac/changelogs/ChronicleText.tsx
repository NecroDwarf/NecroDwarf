import { createElement, type ReactNode } from "react";
import { ContentLink } from "../../../shared/ui/ContentLink";
import { EntityCard } from "../wiki/ui/EntityCards";
import { EntityLink } from "../wiki/ui/EntityLink";
import { ReleaseEntityChange } from "../wiki/ui/ReleaseEntityChange";
import { getRevision } from "../wiki/data/registry";
import { gameVersions } from "../wiki/data/versions";
import type { EntityId, SnapshotId } from "../wiki/data/types";
import type { ChronicleNode } from "./content/types";
import { cardTitle } from "./content";
import { flowerPerkIds } from "./entity-map";

const historicalIds: Readonly<Record<string, EntityId>> = {
  "Хранитель кошмаров": "character:keeper-of-nightmares",
  "Никита Додепович": "character:dodepovich",
  Призрак: "character:ghost",
  "Концентрированный кошмар": "ability:concentrated-nightmare",
  "Зажигалка кошмара": "item:nightmare-lighter",
};
export function ChronicleText({
  nodes,
  version,
}: {
  nodes: ChronicleNode[];
  version: string;
}) {
  const snapshot = `release:${version}` as SnapshotId;
  function render(node: ChronicleNode, key: number): ReactNode {
    if (typeof node === "string")
      return node.trim() ? (
        <span key={key} data-original-text="">
          {node}
        </span>
      ) : (
        node
      );
    const title = cardTitle(node);
    const id =
      node.role === "card"
        ? version === "1.2"
          ? flowerPerkIds[title]
          : historicalIds[title]
        : undefined;
    if (id && getRevision(id, snapshot)) {
      const heading = node.children.find(
        (n) => typeof n !== "string" && n.tag === "h3",
      );
      const originalTitle =
        typeof heading === "object" ? heading.children.map(render) : title;
      const titleContent = <EntityLink id={id}>{originalTitle}</EntityLink>;
      const editorial = (
        <div>
          {node.children.filter((n) => n !== heading).map(render)}
          {node.href && (
            <p>
              <ContentLink href={node.href}>Перейти к разделу →</ContentLink>
            </p>
          )}
        </div>
      );
      const change = gameVersions
        .find((v) => v.id === version)
        ?.changes.find((c) => c.id === id);
      if (change)
        return (
          <ReleaseEntityChange
            key={key}
            change={change}
            entry={{ title: titleContent, editorial }}
          />
        );
      return (
        <EntityCard
          key={key}
          id={id}
          snapshot={snapshot}
          variant="compact"
          showStats={false}
          title={titleContent}
          editorial={editorial}
        />
      );
    }
    const children = node.children.map(render);
    if (node.tag === "a")
      return (
        <ContentLink
          key={key}
          href={node.href!}
          data-role={node.role}
          id={node.id}
        >
          {children}
        </ContentLink>
      );
    return createElement(
      node.tag,
      { key, "data-role": node.role, id: node.id },
      node.tag === "br" ? undefined : children,
    );
  }
  return <>{nodes.map(render)}</>;
}
