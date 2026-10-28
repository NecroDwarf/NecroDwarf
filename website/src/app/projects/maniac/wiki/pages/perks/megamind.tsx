import article from "../../data/perk-articles/megamind.json";
import { ReferenceArticlePage } from "../ReferenceArticlePage";
export default function Page() {
  return <ReferenceArticlePage id="perk:megamind" article={article} />;
}
