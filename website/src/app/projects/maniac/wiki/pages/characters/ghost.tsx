import mechanic0 from "../../data/mechanic-articles/ghost-states.json";
import article from "../../data/character-articles/ghost.json";
import fresco from "../../../assets/characters/ghost-large.webp";
import { CharacterPage } from "../CharacterPage";
export default function CharacterArticlePage() {
  return (
    <CharacterPage
      systems={[{ article: mechanic0, pictures: [] }]}
      id="character:ghost"
      article={article}
      fresco={{ src: fresco, width: 377, height: 950 }}
    />
  );
}
