import { WikiText } from "./WikiText";
import { type EffectDescriptionParts } from "../data/effect-descriptions";
import { InlineStat } from "./InlineStat";
import { EntityLink } from "./EntityLink";
import s from "./EffectDescription.module.css";

export function EffectDescription({
  parts,
}: {
  parts: EffectDescriptionParts;
}) {
  return (
    <p className={s.description}>
      {parts.map((part, index) =>
        typeof part === "string" ? (
          <WikiText key={index} text={part} />
        ) : "entity" in part ? (
          <EntityLink key={index} id={part.entity}>
            {part.label}
          </EntityLink>
        ) : (
          <InlineStat key={index} name={part.stat} />
        ),
      )}
    </p>
  );
}
