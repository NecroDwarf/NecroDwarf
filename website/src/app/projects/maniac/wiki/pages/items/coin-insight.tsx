import article from "../../data/item-articles/coin-insight.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:coin-insight"
      article={article}
      pictures={[]}
    />
  );
}
