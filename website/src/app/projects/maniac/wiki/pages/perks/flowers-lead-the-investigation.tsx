import article from "../../data/perk-articles/flowers-lead-the-investigation.json";
import { ReferenceArticlePage } from "../ReferenceArticlePage";
export default function Page() {
  return (
    <ReferenceArticlePage
      id="perk:flowers-lead-the-investigation"
      article={article}
    />
  );
}
