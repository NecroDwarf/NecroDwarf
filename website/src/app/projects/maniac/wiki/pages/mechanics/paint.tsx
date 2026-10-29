import article from "../../data/mechanic-articles/paint.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage id="mechanic:paint" article={article} pictures={[]} />
  );
}
