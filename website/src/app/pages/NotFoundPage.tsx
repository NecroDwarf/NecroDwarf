import { Link } from "react-router";
import s from "../shared/ui/Content.module.css";
export function NotFoundPage() {
  return (
    <section className={`${s.section} ${s.pageTitle}`}>
      <p className={s.label}>404 / НЕИЗВЕСТНЫЙ МАРШРУТ</p>
      <h1>
        Здесь ещё
        <br />
        ничего не выковано.
      </h1>
      <p className={s.intro}>
        Страница не найдена. Вернёмся туда, где есть что посмотреть.
      </p>
      <Link className={s.primary} to="/">
        На главную ↗
      </Link>
    </section>
  );
}
