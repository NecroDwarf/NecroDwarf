import article from "../../data/mechanic-articles/shaman-spirits.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:shaman-spirits"
      article={article}
      pictures={[]}
    />
  );
}
