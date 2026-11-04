import { createElement, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { DocsLayout } from "./DocsLayout";
import s from "./Docs.module.css";
export type DocNode =
  | string
  | {
      tag: string;
      children?: DocNode[];
      props?: Record<string, string | number | undefined>;
      text?: string;
      language?: string;
    };
export type Heading = { title: string; id: string; level: number };
function CodeBlock({ node }: { node: Exclude<DocNode, string> }) {
  const [status, setStatus] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(node.text ?? "");
      setStatus("Скопировано");
    } catch {
      setStatus("Выделите код и скопируйте вручную");
    }
  }
  return (
    <div className={s.codeBlock}>
      <div className={s.codeBar}>
        <span>{node.language}</span>
        <button type="button" onClick={() => void copy()}>
          Копировать
        </button>
      </div>
      <span className={s.copyStatus} role="status">
        {status}
      </span>
      <pre tabIndex={0} aria-label={`Код ${node.language}`}>
        <code>{renderNodes(node.children ?? [])}</code>
      </pre>
    </div>
  );
}
function renderNodes(nodes: DocNode[]): ReactNode {
  return nodes.map((node, i) => {
    if (typeof node === "string") return node;
    if (node.tag === "pre") return <CodeBlock key={i} node={node} />;
    if (
      node.tag === "a" &&
      String(node.props?.href).startsWith("/projects/novellmaker")
    )
      return (
        <Link key={i} to={String(node.props?.href)}>
          {renderNodes(node.children ?? [])}
        </Link>
      );
    return createElement(
      node.tag,
      { ...node.props, key: i },
      ...(node.children?.length ? [renderNodes(node.children)] : []),
    );
  });
}
export function DocArticle({
  article,
}: {
  article: { title: string; headings: Heading[]; nodes: DocNode[] };
}) {
  return (
    <DocsLayout headings={article.headings}>
      <article className={s.article} data-novellmaker-article>
        {renderNodes(article.nodes)}
      </article>
    </DocsLayout>
  );
}
