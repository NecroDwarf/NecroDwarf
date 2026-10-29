import article from "../../data/item-articles/computer.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage id="item:computer" article={article} pictures={[]} />
  );
}
