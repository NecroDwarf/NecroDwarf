import article from "../../data/mechanic-articles/flower-return.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:flower-return"
      article={article}
      pictures={[]}
    />
  );
}
