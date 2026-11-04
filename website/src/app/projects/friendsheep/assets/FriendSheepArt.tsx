import logo from "./logo.png";
import eventCard from "./screenshots/event-card.webp";

// Скриншот карточки из диплома и исходный логотип без перерисовки.
export function FriendSheepArt() {
  return (
    <svg viewBox="0 0 600 400" fill="none" aria-hidden="true">
      <circle cx="430" cy="200" r="170" fill="#316bc2" fillOpacity=".2" />
      <circle cx="430" cy="200" r="135" stroke="#37a2e6" strokeOpacity=".4" />
      <image href={eventCard} x="90" y="95" width="420" height="273" />
      <image href={logo} x="460" y="60" width="54" height="54" />
    </svg>
  );
}
