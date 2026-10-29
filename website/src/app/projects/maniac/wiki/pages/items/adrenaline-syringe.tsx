import article from "../../data/item-articles/adrenaline-syringe.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="item:adrenaline-syringe"
      article={article}
      pictures={[]}
    />
  );
}
