import article from "../../data/item-articles/forget-me-not.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:forget-me-not"
      article={article}
      pictures={[]}
    />
  );
}
