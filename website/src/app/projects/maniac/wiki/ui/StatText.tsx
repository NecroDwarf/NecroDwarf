import { Fragment } from "react";
import { statTextParts } from "../data/stat-text";
import { InlineStat } from "./InlineStat";

export function StatText({
  text,
  interactive = true,
}: {
  text: string;
  interactive?: boolean;
}) {
  return statTextParts(text).map((part, index) =>
    typeof part === "string" ? (
      <Fragment key={index}>{part}</Fragment>
    ) : (
      <InlineStat
        key={index}
        name={part.symbol}
        original={part.original}
        interactive={interactive}
      />
    ),
  );
}
