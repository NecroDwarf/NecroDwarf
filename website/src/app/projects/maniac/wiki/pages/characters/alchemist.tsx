import article from "../../data/character-articles/alchemist.json";
import fresco from "../../../assets/characters/alchemist-large.webp";
import { CharacterPage } from "../CharacterPage";
export default function CharacterArticlePage() {
  return (
    <CharacterPage
      id="character:alchemist"
      article={article}
      fresco={{ src: fresco, width: 390, height: 913 }}
    />
  );
}
