import article from "../../data/item-articles/dodepovich-coins.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:dodepovich-coins"
      article={article}
      pictures={[]}
    />
  );
}
