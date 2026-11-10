import { getEntity, getRevision } from "../data/registry";
import type { EntityId } from "../data/types";
import {
  currentDescription,
  formatGameText,
} from "../data/current-descriptions";
import { mechanicAnchor } from "../mechanic-placement";
import { EntityStats } from "./EntityCards";
import { WikiText } from "./WikiText";
import { RelatedEffects } from "./RelatedEffects";
import s from "../pages/Wiki.module.css";
import a from "../pages/Systems.module.css";

export interface IntegratedMechanic {
  article: {
    id: string;
    description: string;
    sections: readonly { title: string; paragraphs: readonly string[] }[];
  };
  pictures?: readonly {
    src: string;
    width: number;
    height: number;
    caption: string;
  }[];
}
export function IntegratedMechanics({
  entries,
}: {
  entries: readonly IntegratedMechanic[];
}) {
  return entries.map(({ article, pictures }) => {
    const id = article.id as EntityId<"mechanic">;
    const entity = getEntity(id)!;
    const stats = getRevision(id)!.data.stats;
    return (
      <section
        key={id}
        id={mechanicAnchor(id)}
        data-mechanic-id={id}
        className={s.articleSection}
      >
        <h3>{entity.name}</h3>
        <p>
          <WikiText text={currentDescription(id, article.description)} />
        </p>
        {!!stats?.length && <EntityStats stats={stats} />}
        {article.sections.map((section) => (
          <div key={section.title}>
            <h4>{section.title}</h4>
            {section.paragraphs.map((text, index) => (
              <p key={index}>
                <WikiText text={formatGameText(text)} />
              </p>
            ))}
          </div>
        ))}
        {pictures?.map((picture) => (
          <figure key={picture.src} className={a.figure}>
            <img
              src={picture.src}
              width={picture.width}
              height={picture.height}
              alt={picture.caption
                .replace(/^Оригинальная /, "")
                .replace(/ из руководства\.$/, ".")}
              loading="lazy"
              decoding="async"
            />
          </figure>
        ))}
        <RelatedEffects entityId={id} />
      </section>
    );
  });
}
