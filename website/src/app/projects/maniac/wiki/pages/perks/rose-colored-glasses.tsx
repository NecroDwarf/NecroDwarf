import article from "../../data/perk-articles/rose-colored-glasses.json";
import { ReferenceArticlePage } from "../ReferenceArticlePage";
export default function Page() {
  return (
    <ReferenceArticlePage id="perk:rose-colored-glasses" article={article} />
  );
}
