import { contacts } from "../content/team";
import s from "./Content.module.css";
export function Contacts() {
  return (
    <div className={s.contacts}>
      {contacts.map((contact) => (
        <a href={contact.url} key={contact.url}>
          <span>
            {contact.name}
            <span aria-hidden="true"> ↗</span>
          </span>
          <small>{contact.note}</small>
        </a>
      ))}
    </div>
  );
}
