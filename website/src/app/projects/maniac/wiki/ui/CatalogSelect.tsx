import type { ReactNode } from "react";
import r from "../pages/Reference.module.css";

export function CatalogSelect({
  label,
  ariaLabel,
  value,
  onChange,
  children,
}: {
  label: string;
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className={r.selectLabel}>
      {label}
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}
