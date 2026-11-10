import mechanic0 from "../../data/mechanic-articles/alchemy.json";
import mechanic0image0 from "../../../assets/wiki/systems/guide-alchemy-0.webp";
import article from "../../data/character-articles/alchemist.json";
import fresco from "../../../assets/characters/alchemist-large.webp";
import { CharacterPage } from "../CharacterPage";
export default function CharacterArticlePage() {
  return (
    <CharacterPage
      systems={[
        {
          article: mechanic0,
          pictures: [{ ...mechanic0.images[0], src: mechanic0image0 }],
        },
      ]}
      id="character:alchemist"
      article={article}
      fresco={{ src: fresco, width: 390, height: 913 }}
    />
  );
}
