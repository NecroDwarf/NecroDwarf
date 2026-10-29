import article from "../../data/mechanic-articles/nightmare-trials.json";
import image0 from "../../../assets/wiki/systems/guide-nightmare-trials-0.webp";
import { SystemsArticlePage } from "../SystemsArticlePage";
export default function Page() {
  return (
    <SystemsArticlePage
      id="mechanic:nightmare-trials"
      article={article}
      pictures={[{ ...article.images[0], src: image0 }]}
    />
  );
}
