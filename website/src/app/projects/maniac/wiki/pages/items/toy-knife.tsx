import article from "../../data/item-articles/toy-knife.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage id="item:toy-knife" article={article} pictures={[]} />
  );
}
