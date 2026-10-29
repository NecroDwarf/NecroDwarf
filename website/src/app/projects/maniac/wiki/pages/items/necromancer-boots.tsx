import article from "../../data/item-articles/necromancer-boots.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:necromancer-boots"
      article={article}
      pictures={[]}
    />
  );
}
