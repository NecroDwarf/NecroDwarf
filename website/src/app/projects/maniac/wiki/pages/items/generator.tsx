import article from "../../data/item-articles/generator.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage id="item:generator" article={article} pictures={[]} />
  );
}
