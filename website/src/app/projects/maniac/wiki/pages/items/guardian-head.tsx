import article from "../../data/item-articles/guardian-head.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:guardian-head"
      article={article}
      pictures={[]}
    />
  );
}
