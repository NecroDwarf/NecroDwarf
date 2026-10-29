import article from "../../data/item-articles/microphone.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage id="item:microphone" article={article} pictures={[]} />
  );
}
