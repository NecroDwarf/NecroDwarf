import article from "../../data/mechanic-articles/medical-care.json";
import image0 from "../../../assets/wiki/systems/guide-medical-care-0.webp";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:medical-care"
      article={article}
      pictures={[{ ...article.images[0], src: image0 }]}
    />
  );
}
