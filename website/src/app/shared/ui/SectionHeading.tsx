import type { ReactNode } from "react";
import s from "./Content.module.css";
export function SectionHeading({
  index,
  label,
  title,
  action,
}: {
  index: string;
  label: string;
  title: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={s.heading}>
      <div>
        <p className={s.label}>
          <span>{index}</span>
          <i />
          {label}
        </p>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}
