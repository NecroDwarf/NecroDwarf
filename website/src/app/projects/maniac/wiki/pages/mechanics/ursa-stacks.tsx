import article from "../../data/mechanic-articles/ursa-stacks.json";
import image0 from "../../../assets/wiki/systems/guide-ursa-stacks-0.webp";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:ursa-stacks"
      article={article}
      pictures={[{ ...article.images[0], src: image0 }]}
    />
  );
}
