import article from "../../data/mechanic-articles/qte.json";
import image0 from "../../../assets/wiki/systems/guide-qte-0.webp";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:qte"
      article={article}
      pictures={[{ ...article.images[0], src: image0 }]}
    />
  );
}
