import mechanic0 from "../../data/mechanic-articles/color-roulette.json";
import article from "../../data/perk-articles/color-roulette.json";
import { ReferenceArticlePage } from "../ReferenceArticlePage";
export default function Page() {
  return (
    <ReferenceArticlePage
      systems={[{ article: mechanic0, pictures: [] }]}
      id="perk:color-roulette"
      article={article}
    />
  );
}
