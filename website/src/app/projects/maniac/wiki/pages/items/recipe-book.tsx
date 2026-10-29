import article from "../../data/item-articles/recipe-book.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage id="item:recipe-book" article={article} pictures={[]} />
  );
}
