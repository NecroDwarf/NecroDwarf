import article from "../../data/character-articles/keeper-of-nightmares.json";
import fresco from "../../../assets/characters/keeper_of_nightmares-large.webp";
import { CharacterPage } from "../CharacterPage";
import { CharacterModelViewer } from "../../model/CharacterModelViewer";
import { characterModels } from "../../model/models";
export default function CharacterArticlePage() {
  return (
    <CharacterPage
      id="character:keeper-of-nightmares"
      article={article}
      fresco={{ src: fresco, width: 619, height: 1100 }}
    >
      <CharacterModelViewer model={characterModels["keeper-nightmares"]} />
    </CharacterPage>
  );
}
