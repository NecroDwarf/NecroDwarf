import article from "../../data/item-articles/beehive-food.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:beehive-food"
      article={article}
      pictures={[]}
    />
  );
}
