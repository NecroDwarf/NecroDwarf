import article from "../../data/mechanic-articles/sanity.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage id="mechanic:sanity" article={article} pictures={[]} />
  );
}
