import article from "../../data/mechanic-articles/status-effects.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:status-effects"
      article={article}
      pictures={[]}
    />
  );
}
