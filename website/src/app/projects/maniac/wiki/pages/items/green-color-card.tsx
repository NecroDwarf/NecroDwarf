import article from "../../data/item-articles/green-color-card.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:green-color-card"
      article={article}
      pictures={[]}
    />
  );
}
