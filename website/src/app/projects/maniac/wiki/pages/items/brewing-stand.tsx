import article from "../../data/item-articles/brewing-stand.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:brewing-stand"
      article={article}
      pictures={[]}
    />
  );
}
