import article from "../../data/perk-articles/silence.json";
import { ReferenceArticlePage } from "../ReferenceArticlePage";
export default function Page() {
  return <ReferenceArticlePage id="perk:silence" article={article} />;
}
