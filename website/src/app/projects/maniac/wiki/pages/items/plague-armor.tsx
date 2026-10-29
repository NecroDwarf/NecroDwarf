import article from "../../data/item-articles/plague-armor.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:plague-armor"
      article={article}
      pictures={[]}
    />
  );
}
