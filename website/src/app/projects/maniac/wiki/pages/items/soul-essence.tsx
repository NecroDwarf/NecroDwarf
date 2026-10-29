import article from "../../data/item-articles/soul-essence.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:soul-essence"
      article={article}
      pictures={[]}
    />
  );
}
