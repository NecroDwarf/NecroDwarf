import article from "../../data/mechanic-articles/map-interactions.json";
import image0 from "../../../assets/wiki/systems/guide-map-interactions-0.webp";
import image1 from "../../../assets/wiki/systems/guide-map-interactions-1.webp";
import image2 from "../../../assets/wiki/systems/guide-map-interactions-2.webp";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:map-interactions"
      article={article}
      pictures={[
        { ...article.images[0], src: image0 },
        { ...article.images[1], src: image1 },
        { ...article.images[2], src: image2 },
      ]}
    />
  );
}
