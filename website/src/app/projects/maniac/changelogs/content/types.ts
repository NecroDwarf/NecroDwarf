export type ChronicleNode =
  | string
  | {
      tag:
        | "article"
        | "div"
        | "span"
        | "p"
        | "a"
        | "ul"
        | "ol"
        | "li"
        | "strong"
        | "em"
        | "b"
        | "i"
        | "br"
        | "table"
        | "thead"
        | "tbody"
        | "tr"
        | "th"
        | "td"
        | "code"
        | "h3"
        | "h4"
        | "details"
        | "summary";
      role?: string;
      href?: string;
      id?: string;
      children: ChronicleNode[];
    };
export interface ChronicleContent {
  version: string;
  intro: string;
  note: string;
  stats: { value: string; label: string }[];
  sections: { id: string; title: string; nodes: ChronicleNode[] }[];
}
