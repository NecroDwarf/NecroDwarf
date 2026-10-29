import article from "../../data/mechanic-articles/plague.json";
import image0 from "../../../assets/wiki/systems/guide-plague-0.webp";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:plague"
      article={article}
      pictures={[{ ...article.images[0], src: image0 }]}
    />
  );
}
