import article from "../../data/mechanic-articles/agent-shop.json";
import image0 from "../../../assets/wiki/systems/guide-agent-shop-0.webp";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:agent-shop"
      article={article}
      pictures={[{ ...article.images[0], src: image0 }]}
    />
  );
}
