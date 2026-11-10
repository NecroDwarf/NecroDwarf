import mechanic0 from "../../data/mechanic-articles/agent-shop.json";
import mechanic0image0 from "../../../assets/wiki/systems/guide-agent-shop-0.webp";
import article from "../../data/character-articles/agent.json";
import fresco from "../../../assets/characters/agent-large.webp";
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
      id="character:agent"
      article={article}
      fresco={{ src: fresco, width: 442, height: 969 }}
    />
  );
}
