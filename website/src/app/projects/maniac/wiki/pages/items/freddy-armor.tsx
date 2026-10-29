import article from "../../data/item-articles/freddy-armor.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:freddy-armor"
      article={article}
      pictures={[]}
    />
  );
}
