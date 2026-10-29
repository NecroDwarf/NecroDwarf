import article from "../../data/mechanic-articles/addiction.json";
import image0 from "../../../assets/wiki/systems/guide-addiction-0.webp";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:addiction"
      article={article}
      pictures={[{ ...article.images[0], src: image0 }]}
    />
  );
}
