import article from "../../data/item-articles/medical-mask.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:medical-mask"
      article={article}
      pictures={[]}
    />
  );
}
