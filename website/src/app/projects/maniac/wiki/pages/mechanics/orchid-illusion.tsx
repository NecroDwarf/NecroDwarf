import article from "../../data/mechanic-articles/orchid-illusion.json";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:orchid-illusion"
      article={article}
      pictures={[]}
    />
  );
}
