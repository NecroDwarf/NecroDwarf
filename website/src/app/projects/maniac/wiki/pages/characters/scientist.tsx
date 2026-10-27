import article from "../../data/character-articles/scientist.json";
import fresco from "../../../assets/characters/scientist-large.webp";
import { CharacterPage } from "../CharacterPage";
export default function CharacterArticlePage() {
  return (
    <CharacterPage
      id="character:scientist"
      article={article}
      fresco={{ src: fresco, width: 445, height: 906 }}
    />
  );
}
