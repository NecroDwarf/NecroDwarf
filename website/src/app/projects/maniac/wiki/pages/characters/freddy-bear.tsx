import article from "../../data/character-articles/freddy-bear.json";
import fresco from "../../../assets/characters/freddy_bear-large.webp";
import { CharacterPage } from "../CharacterPage";
export default function CharacterArticlePage() {
  return (
    <CharacterPage
      id="character:freddy-bear"
      article={article}
      fresco={{ src: fresco, width: 452, height: 904 }}
    />
  );
}
