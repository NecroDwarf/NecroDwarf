import article from "../../data/character-articles/dodepovich.json";
import fresco from "../../../assets/characters/dodepovich-large.webp";
import { CharacterPage } from "../CharacterPage";
export default function CharacterArticlePage() {
  return (
    <CharacterPage
      id="character:dodepovich"
      article={article}
      fresco={{ src: fresco, width: 550, height: 1100 }}
    />
  );
}
