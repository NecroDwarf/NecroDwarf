import article from "../../data/mechanic-articles/hacking.json";
import image0 from "../../../assets/wiki/systems/guide-hacking-0.webp";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:hacking"
      article={article}
      pictures={[{ ...article.images[0], src: image0 }]}
    />
  );
}
