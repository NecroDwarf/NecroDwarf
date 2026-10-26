import { useState } from "react";
import { CharacterModelViewer } from "../wiki/model/CharacterModelViewer";
import { characterModels } from "../wiki/model/models";
import {
  CharacterCard,
  AbilityCard,
  PerkCard,
  ItemCard,
} from "../wiki/ui/EntityCards";
import { ReleaseEntityChange } from "../wiki/ui/ReleaseEntityChange";
import { getRevision } from "../wiki/data/registry";
import { gameVersions } from "../wiki/data/versions";
import theme from "../theme/theme.module.css";
import s from "./ManiacLab.module.css";

export function ManiacLab() {
  const [mounted, setMounted] = useState(true);
  const modelId = getRevision("character:keeper-of-nightmares")?.data.model;
  const model = modelId ? characterModels[modelId] : undefined;
  const change = gameVersions.find((version) => version.id === "1.2")
    ?.changes[0];
  return (
    <main className={`${theme.page} ${s.page}`}>
      <header>
        <p className={s.label}>NECRODWARF / MANIAC / DEV PREVIEW</p>
        <h1>Хранитель кошмаров</h1>
        <p className={s.intro}>
          Фундамент Wiki: оригинальная модель, связанные сущности и история
          характеристик. Этот прототип не входит в публичные маршруты сайта.
        </p>
      </header>
      <section aria-labelledby="model-heading">
        <h2 id="model-heading">Оригинальная 3D-модель</h2>
        <p className={s.note}>
          Одна модель, без альтернативных форм. Статическая поза из GeckoLib;
          геометрия и текстура из мода.
        </p>
        <button
          className={s.toggle}
          type="button"
          onClick={() => setMounted(!mounted)}
        >
          {mounted ? "Выгрузить просмотрщик" : "Вернуть просмотрщик"}
        </button>
        {mounted && <CharacterModelViewer model={model} />}
      </section>
      <section>
        <h2>Персонаж и его способности</h2>
        <div className={s.grid}>
          <CharacterCard id="character:keeper-of-nightmares" />
          <AbilityCard id="ability:concentrated-nightmare" />
          <ItemCard id="item:nightmare-lighter" />
        </div>
      </section>
      <section>
        <h2>Без вымышленных моделей</h2>
        <div className={s.grid}>
          <CharacterCard id="character:ghost" variant="compact" />
          <CharacterCard id="character:dodepovich" variant="compact" />
        </div>
      </section>
      <section>
        <h2>Компактные карточки и пиксельные предметы</h2>
        <div className={s.grid}>
          <AbilityCard id="ability:concentrated-nightmare" variant="compact" />
          <ItemCard id="item:nightmare-lighter" variant="compact" />
          <ItemCard id="item:forget-me-not" variant="compact" />
        </div>
      </section>
      <section>
        <h2>История и справочник — разные снимки</h2>
        <p className={s.note}>
          Слева — проверенный commit исходников, справа — только сведения
          хроники 1.2. Перезарядки из кода не дополняют исторический снимок
          автоматически.
        </p>
        <div className={s.grid}>
          <PerkCard id="perk:forget-me-not" />
          {change && <ReleaseEntityChange change={change} />}
        </div>
      </section>
    </main>
  );
}
