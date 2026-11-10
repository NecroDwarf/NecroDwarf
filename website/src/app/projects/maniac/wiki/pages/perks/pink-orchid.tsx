import mechanic0 from "../../data/mechanic-articles/orchid-illusion.json";
import article from "../../data/perk-articles/pink-orchid.json";
import { ReferenceArticlePage } from "../ReferenceArticlePage";
export default function Page() {
  return (
    <ReferenceArticlePage
      systems={[{ article: mechanic0, pictures: [] }]}
      id="perk:pink-orchid"
      article={article}
    />
  );
}
