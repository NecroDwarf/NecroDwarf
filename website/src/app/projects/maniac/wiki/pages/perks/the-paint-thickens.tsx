import article from "../../data/perk-articles/the-paint-thickens.json";
import { ReferenceArticlePage } from "../ReferenceArticlePage";
export default function Page() {
  return (
    <ReferenceArticlePage id="perk:the-paint-thickens" article={article} />
  );
}
