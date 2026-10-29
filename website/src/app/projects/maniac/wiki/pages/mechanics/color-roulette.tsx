import article from "../../data/mechanic-articles/color-roulette.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:color-roulette"
      article={article}
      pictures={[]}
    />
  );
}
