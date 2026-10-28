import article from "../../data/perk-articles/bouquet-to-the-other-side.json";
import { ReferenceArticlePage } from "../ReferenceArticlePage";
export default function Page() {
  return (
    <ReferenceArticlePage
      id="perk:bouquet-to-the-other-side"
      article={article}
    />
  );
}
