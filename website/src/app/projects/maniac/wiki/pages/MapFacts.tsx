import type { MapMeta } from "../data/maps";
import { DifficultyStars } from "../ui/DifficultyStars";
import { InlineStat } from "../ui/InlineStat";
import s from "./Maps.module.css";
export function MapFacts({ map }: { map: MapMeta }) {
  return (
    <dl className={s.facts}>
      <div>
        <dt>Размер по руководству</dt>
        <dd>
          {map.size}{" "}
          <InlineStat name="range" label="Размер карты" interactive={false} />
        </dd>
      </div>
      <div>
        <dt>Сложность</dt>
        <dd>
          <DifficultyStars value={map.difficulty} />
        </dd>
      </div>
    </dl>
  );
}
