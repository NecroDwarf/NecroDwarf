import mechanic0 from "../../data/mechanic-articles/sanity.json";
import mechanic1 from "../../data/mechanic-articles/nightmare-trials.json";
import mechanic1image0 from "../../../assets/wiki/systems/guide-nightmare-trials-0.webp";
import article from "../../data/character-articles/keeper-of-nightmares.json";
import fresco from "../../../assets/characters/keeper_of_nightmares-large.webp";
import { CharacterPage } from "../CharacterPage";
import { CharacterModelViewer } from "../../model/CharacterModelViewer";
import { characterModels } from "../../model/models";
export default function CharacterArticlePage() {
  return (
    <CharacterPage
      systems={[
        { article: mechanic0, pictures: [] },
        {
          article: mechanic1,
          pictures: [{ ...mechanic1.images[0], src: mechanic1image0 }],
        },
      ]}
      id="character:keeper-of-nightmares"
      article={article}
      fresco={{ src: fresco, width: 619, height: 1100 }}
    >
      <CharacterModelViewer model={characterModels["keeper-nightmares"]} />
    </CharacterPage>
  );
}
