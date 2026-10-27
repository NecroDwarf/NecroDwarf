import article from "../../data/character-articles/pudge.json";
import fresco from "../../../assets/characters/pudge-large.webp";
import { CharacterPage } from "../CharacterPage";
export default function CharacterArticlePage() {
  return (
    <CharacterPage
      id="character:pudge"
      article={article}
      fresco={{ src: fresco, width: 433, height: 910 }}
    />
  );
}
