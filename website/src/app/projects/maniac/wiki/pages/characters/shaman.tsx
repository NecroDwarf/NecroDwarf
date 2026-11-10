import mechanic0 from "../../data/mechanic-articles/shaman-spirits.json";
import article from "../../data/character-articles/shaman.json";
import fresco from "../../../assets/characters/shaman-large.webp";
import { CharacterPage } from "../CharacterPage";
export default function CharacterArticlePage() {
  return (
    <CharacterPage
      systems={[{ article: mechanic0, pictures: [] }]}
      id="character:shaman"
      article={article}
      fresco={{ src: fresco, width: 470, height: 1100 }}
    />
  );
}
