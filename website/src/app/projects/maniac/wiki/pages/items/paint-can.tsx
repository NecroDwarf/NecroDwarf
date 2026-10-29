import article from "../../data/item-articles/paint-can.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage id="item:paint-can" article={article} pictures={[]} />
  );
}
