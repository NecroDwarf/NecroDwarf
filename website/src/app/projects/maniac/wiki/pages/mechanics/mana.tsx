import article from "../../data/mechanic-articles/mana.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage id="mechanic:mana" article={article} pictures={[]} />
  );
}
