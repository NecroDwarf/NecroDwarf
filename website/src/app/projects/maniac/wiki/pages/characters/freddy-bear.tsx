import mechanic0 from "../../data/mechanic-articles/freddy-generator.json";
import mechanic0image0 from "../../../assets/wiki/systems/guide-freddy-generator-0.webp";
import article from "../../data/character-articles/freddy-bear.json";
import fresco from "../../../assets/characters/freddy_bear-large.webp";
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
      id="character:freddy-bear"
      article={article}
      fresco={{ src: fresco, width: 452, height: 904 }}
    />
  );
}
