import article from "../../data/character-articles/ursa.json";
import fresco from "../../../assets/characters/ursa-large.webp";
import { CharacterPage } from "../CharacterPage";
export default function CharacterArticlePage() {
  return (
    <CharacterPage
      id="character:ursa"
      article={article}
      fresco={{ src: fresco, width: 452, height: 1100 }}
    />
  );
}
