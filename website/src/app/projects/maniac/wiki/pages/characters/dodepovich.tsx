import mechanic0 from "../../data/mechanic-articles/casino.json";
import article from "../../data/character-articles/dodepovich.json";
import fresco from "../../../assets/characters/dodepovich-large.webp";
import { CharacterPage } from "../CharacterPage";
export default function CharacterArticlePage() {
  return (
    <CharacterPage
      systems={[{ article: mechanic0, pictures: [] }]}
      id="character:dodepovich"
      article={article}
      fresco={{ src: fresco, width: 550, height: 1100 }}
    />
  );
}
