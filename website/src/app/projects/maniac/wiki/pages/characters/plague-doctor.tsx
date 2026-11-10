import mechanic0 from "../../data/mechanic-articles/plague.json";
import mechanic0image0 from "../../../assets/wiki/systems/guide-plague-0.webp";
import article from "../../data/character-articles/plague-doctor.json";
import fresco from "../../../assets/characters/plague_doctor-large.webp";
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
      id="character:plague-doctor"
      article={article}
      fresco={{ src: fresco, width: 396, height: 915 }}
    />
  );
}
