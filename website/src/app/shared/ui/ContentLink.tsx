import type { ComponentProps } from "react";

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
