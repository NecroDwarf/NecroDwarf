import article from "../../data/mechanic-articles/freddy-generator.json";
import image0 from "../../../assets/wiki/systems/guide-freddy-generator-0.webp";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:freddy-generator"
      article={article}
      pictures={[{ ...article.images[0], src: image0 }]}
    />
  );
}
