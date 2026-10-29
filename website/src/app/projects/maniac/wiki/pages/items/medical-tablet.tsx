import article from "../../data/item-articles/medical-tablet.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:medical-tablet"
      article={article}
      pictures={[]}
    />
  );
}
