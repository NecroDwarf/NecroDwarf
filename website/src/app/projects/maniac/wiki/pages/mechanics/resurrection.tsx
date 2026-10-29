import article from "../../data/mechanic-articles/resurrection.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:resurrection"
      article={article}
      pictures={[]}
    />
  );
}
