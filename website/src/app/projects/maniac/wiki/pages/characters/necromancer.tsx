import article from "../../data/character-articles/necromancer.json";
import fresco from "../../../assets/characters/necromancer-large.webp";
import { CharacterPage } from "../CharacterPage";
export default function CharacterArticlePage() {
  return (
    <CharacterPage
      id="character:necromancer"
      article={article}
      fresco={{ src: fresco, width: 436, height: 910 }}
    />
  );
}
