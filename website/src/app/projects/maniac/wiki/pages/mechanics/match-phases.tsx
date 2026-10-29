import article from "../../data/mechanic-articles/match-phases.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:match-phases"
      article={article}
      pictures={[]}
    />
  );
}
