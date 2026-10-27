import article from "../../data/character-articles/doctor.json";
import fresco from "../../../assets/characters/doctor-large.webp";
import { CharacterPage } from "../CharacterPage";
export default function CharacterArticlePage() {
  return (
    <CharacterPage
      id="character:doctor"
      article={article}
      fresco={{ src: fresco, width: 440, height: 968 }}
    />
  );
}
