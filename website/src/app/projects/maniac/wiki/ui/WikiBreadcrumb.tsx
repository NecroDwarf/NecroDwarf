import { Link } from "react-router";
import s from "../pages/Wiki.module.css";

export function WikiBreadcrumb({
  section,
  label,
  name,
  ariaLabel = "Путь к статье",
}: {
  section: string;
  label: string;
  name: string;
  ariaLabel?: string;
}) {
  return (
    <nav className={s.breadcrumb} aria-label={ariaLabel}>
      <Link to="/projects/maniac/wiki">Wiki</Link>
      <span>/</span>
      <Link to={`/projects/maniac/wiki/${section}`}>{label}</Link>
      <span>/</span>
      <span>{name}</span>
    </nav>
  );
}
