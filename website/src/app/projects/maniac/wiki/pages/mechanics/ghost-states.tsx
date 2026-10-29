import article from "../../data/mechanic-articles/ghost-states.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:ghost-states"
      article={article}
      pictures={[]}
    />
  );
}
