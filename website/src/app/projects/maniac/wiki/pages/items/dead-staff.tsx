import article from "../../data/item-articles/dead-staff.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage id="item:dead-staff" article={article} pictures={[]} />
  );
}
