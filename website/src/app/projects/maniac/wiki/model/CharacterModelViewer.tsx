import { Component, lazy, Suspense, useState } from "react";
import type { ReactNode } from "react";
import type { CharacterModel } from "./types";
import s from "./ModelViewer.module.css";
const ModelCanvas = lazy(() => import("./ModelCanvas"));
class ViewerBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p role="status">
        Не удалось загрузить 3D-просмотрщик. Текстовое описание персонажа
        доступно ниже.
      </p>
    ) : (
      this.props.children
    );
  }
}
export function CharacterModelViewer({ model }: { model?: CharacterModel }) {
  const [active, setActive] = useState(false);
  if (!model) return null;
  return (
    <section className={s.viewer} aria-label={`3D-модель: ${model.label}`}>
      <ViewerBoundary key={model.src}>
        {active ? (
          <Suspense fallback={<p role="status">Загрузка 3D-просмотрщика…</p>}>
            <ModelCanvas model={model} />
          </Suspense>
        ) : (
          <div className={s.placeholder}>
            <p>Оригинальная модель · {model.label}</p>
            <button type="button" onClick={() => setActive(true)}>
              Загрузить 3D-модель
            </button>
            <p>
              Модель загружается по запросу. Мышь и жесты вращают камеру;
              масштаб и сброс доступны кнопками.
            </p>
            <noscript>Для интерактивного просмотра нужен JavaScript.</noscript>
          </div>
        )}
      </ViewerBoundary>
    </section>
  );
}
