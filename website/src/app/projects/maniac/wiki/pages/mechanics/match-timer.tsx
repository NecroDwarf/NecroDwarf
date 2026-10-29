import article from "../../data/mechanic-articles/match-timer.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:match-timer"
      article={article}
      pictures={[]}
    />
  );
}
