import article from "../../data/item-articles/awakening-needle.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:awakening-needle"
      article={article}
      pictures={[]}
    />
  );
}
