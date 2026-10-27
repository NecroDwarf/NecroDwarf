import article from "../../data/character-articles/agent.json";
import fresco from "../../../assets/characters/agent-large.webp";
import { CharacterPage } from "../CharacterPage";
export default function CharacterArticlePage() {
  return (
    <CharacterPage
      id="character:agent"
      article={article}
      fresco={{ src: fresco, width: 442, height: 969 }}
    />
  );
}
