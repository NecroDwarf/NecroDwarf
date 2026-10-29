import article from "../../data/item-articles/red-color-card.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:red-color-card"
      article={article}
      pictures={[]}
    />
  );
}
