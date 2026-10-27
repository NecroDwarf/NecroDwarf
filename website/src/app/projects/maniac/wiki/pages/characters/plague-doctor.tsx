import article from "../../data/character-articles/plague-doctor.json";
import fresco from "../../../assets/characters/plague_doctor-large.webp";
import { CharacterPage } from "../CharacterPage";
export default function CharacterArticlePage() {
  return (
    <CharacterPage
      id="character:plague-doctor"
      article={article}
      fresco={{ src: fresco, width: 396, height: 915 }}
    />
  );
}
