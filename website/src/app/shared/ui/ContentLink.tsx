import type { ComponentProps } from "react";
import { Link, type LinkProps } from "react-router";
import s from "./BackLink.module.css";

export function BackLink({ to, children }: Pick<LinkProps, "to" | "children">) {
  return (
    <Link to={to} className={s.backLink}>
      <span className={s.arrow} aria-hidden="true">
        ←
      </span>
      <span>{children}</span>
    </Link>
  );
}

export function ContentLink({
  href,
  ...props
}: Omit<ComponentProps<"a">, "target" | "rel">) {
  const external = /^(?:https?:)?\/\//i.test(href ?? "");
  return (
    <a
      {...props}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    />
  );
}
