import article from "../../data/item-articles/rose-colored-glasses.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:rose-colored-glasses"
      article={article}
      pictures={[]}
    />
  );
}
