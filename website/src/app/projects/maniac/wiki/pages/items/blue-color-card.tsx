import article from "../../data/item-articles/blue-color-card.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:blue-color-card"
      article={article}
      pictures={[]}
    />
  );
}
