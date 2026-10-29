import article from "../../data/item-articles/agent-armor.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage id="item:agent-armor" article={article} pictures={[]} />
  );
}
