import mechanic0 from "../../data/mechanic-articles/ursa-stacks.json";
import mechanic0image0 from "../../../assets/wiki/systems/guide-ursa-stacks-0.webp";
import article from "../../data/character-articles/ursa.json";
import fresco from "../../../assets/characters/ursa-large.webp";
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
      id="character:ursa"
      article={article}
      fresco={{ src: fresco, width: 452, height: 1100 }}
    />
  );
}
