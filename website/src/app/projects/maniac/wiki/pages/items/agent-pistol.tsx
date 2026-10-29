import article from "../../data/item-articles/agent-pistol.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:agent-pistol"
      article={article}
      pictures={[]}
    />
  );
}
