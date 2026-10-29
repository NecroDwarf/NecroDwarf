import article from "../../data/mechanic-articles/alchemy.json";
import image0 from "../../../assets/wiki/systems/guide-alchemy-0.webp";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:alchemy"
      article={article}
      pictures={[{ ...article.images[0], src: image0 }]}
    />
  );
}
