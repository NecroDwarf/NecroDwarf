import article from "../../data/ability-articles/concentrated-nightmare.json";
import { ReferenceArticlePage } from "../ReferenceArticlePage";
export default function Page() {
  return (
    <ReferenceArticlePage
      id="ability:concentrated-nightmare"
      article={article}
    />
  );
}
