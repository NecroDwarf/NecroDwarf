import article from "../../data/mechanic-articles/traps.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage id="mechanic:traps" article={article} pictures={[]} />
  );
}
