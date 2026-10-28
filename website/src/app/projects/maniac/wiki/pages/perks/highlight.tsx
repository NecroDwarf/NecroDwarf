import article from "../../data/perk-articles/highlight.json";
import { ReferenceArticlePage } from "../ReferenceArticlePage";
export default function Page() {
  return <ReferenceArticlePage id="perk:highlight" article={article} />;
}
