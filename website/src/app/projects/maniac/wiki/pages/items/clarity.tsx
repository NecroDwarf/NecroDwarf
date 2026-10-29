import article from "../../data/item-articles/clarity.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage id="item:clarity" article={article} pictures={[]} />
  );
}
