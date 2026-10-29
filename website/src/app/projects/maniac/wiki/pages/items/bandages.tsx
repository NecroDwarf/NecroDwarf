import article from "../../data/item-articles/bandages.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage id="item:bandages" article={article} pictures={[]} />
  );
}
