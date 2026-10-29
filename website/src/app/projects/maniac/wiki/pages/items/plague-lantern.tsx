import article from "../../data/item-articles/plague-lantern.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:plague-lantern"
      article={article}
      pictures={[]}
    />
  );
}
