import article from "../../data/item-articles/slot-machine.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:slot-machine"
      article={article}
      pictures={[]}
    />
  );
}
