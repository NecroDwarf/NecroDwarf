import article from "../../data/character-articles/death.json";
import fresco from "../../../assets/characters/death-large.webp";
import { CharacterPage } from "../CharacterPage";
export default function CharacterArticlePage() {
  return (
    <CharacterPage
      id="character:death"
      article={article}
      fresco={{ src: fresco, width: 441, height: 968 }}
    />
  );
}
