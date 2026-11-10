import mechanic0 from "../../data/mechanic-articles/medical-care.json";
import mechanic0image0 from "../../../assets/wiki/systems/guide-medical-care-0.webp";
import article from "../../data/character-articles/doctor.json";
import fresco from "../../../assets/characters/doctor-large.webp";
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
      id="character:doctor"
      article={article}
      fresco={{ src: fresco, width: 440, height: 968 }}
    />
  );
}
