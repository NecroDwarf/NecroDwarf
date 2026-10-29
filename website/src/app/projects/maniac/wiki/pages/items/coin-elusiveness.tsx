import article from "../../data/item-articles/coin-elusiveness.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:coin-elusiveness"
      article={article}
      pictures={[]}
    />
  );
}
