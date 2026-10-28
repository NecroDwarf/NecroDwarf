import article from "../../data/perk-articles/emergency-overclock.json";
import { ReferenceArticlePage } from "../ReferenceArticlePage";
export default function Page() {
  return (
    <ReferenceArticlePage id="perk:emergency-overclock" article={article} />
  );
}
