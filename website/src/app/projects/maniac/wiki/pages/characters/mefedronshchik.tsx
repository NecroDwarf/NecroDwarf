import article from "../../data/character-articles/mefedronshchik.json";
import fresco from "../../../assets/characters/mefedronshchik-large.webp";
import { CharacterPage } from "../CharacterPage";
export default function CharacterArticlePage() {
  return (
    <CharacterPage
      id="character:mefedronshchik"
      article={article}
      fresco={{ src: fresco, width: 442, height: 972 }}
    />
  );
}
