import article from "../../data/mechanic-articles/casino.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage id="mechanic:casino" article={article} pictures={[]} />
  );
}
