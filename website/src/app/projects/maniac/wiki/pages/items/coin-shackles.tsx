import article from "../../data/item-articles/coin-shackles.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:coin-shackles"
      article={article}
      pictures={[]}
    />
  );
}
