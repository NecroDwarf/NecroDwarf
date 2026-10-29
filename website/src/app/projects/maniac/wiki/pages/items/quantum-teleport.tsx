import article from "../../data/item-articles/quantum-teleport.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:quantum-teleport"
      article={article}
      pictures={[]}
    />
  );
}
