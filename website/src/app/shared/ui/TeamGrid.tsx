import { team } from "../content/team";
import s from "./Content.module.css";
export function TeamGrid() {
  return (
    <div className={s.team}>
      {team.map((person, index) => (
        <article key={person.name}>
          <span className={s.memberNumber} aria-hidden="true">
            0{index + 1} /
          </span>
          <h3>{person.name}</h3>
          <p>{person.caption}</p>
        </article>
      ))}
    </div>
  );
}
