import article from "../../data/mechanic-articles/objectives-and-escape.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:objectives-and-escape"
      article={article}
      pictures={[]}
    />
  );
}
