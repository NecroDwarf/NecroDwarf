import mechanic0 from "../../data/mechanic-articles/paint.json";
import article from "../../data/perk-articles/the-paint-thickens.json";
import { ReferenceArticlePage } from "../ReferenceArticlePage";
export default function Page() {
  return (
    <ReferenceArticlePage
      systems={[{ article: mechanic0, pictures: [] }]}
      id="perk:the-paint-thickens"
      article={article}
    />
  );
}
