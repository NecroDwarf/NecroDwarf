import mechanic0 from "../../data/mechanic-articles/flower-return.json";
import article from "../../data/perk-articles/forget-me-not.json";
import { ReferenceArticlePage } from "../ReferenceArticlePage";
export default function Page() {
  return (
    <ReferenceArticlePage
      systems={[{ article: mechanic0, pictures: [] }]}
      id="perk:forget-me-not"
      article={article}
    />
  );
}
