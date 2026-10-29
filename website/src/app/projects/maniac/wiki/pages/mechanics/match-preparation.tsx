import article from "../../data/mechanic-articles/match-preparation.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:match-preparation"
      article={article}
      pictures={[]}
    />
  );
}
