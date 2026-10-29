import article from "../../data/mechanic-articles/downed.json";
import image0 from "../../../assets/wiki/systems/guide-downed-0.webp";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:downed"
      article={article}
      pictures={[{ ...article.images[0], src: image0 }]}
    />
  );
}
