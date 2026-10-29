import article from "../../data/item-articles/death-scythe.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:death-scythe"
      article={article}
      pictures={[]}
    />
  );
}
