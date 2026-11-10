import logo from "./novellmaker.svg?no-inline";
export function NovellMakerArt() {
  return (
    <img
      src={logo}
      width="256"
      height="256"
      loading="lazy"
      alt="Логотип NovellMaker"
      style={{ objectFit: "contain" }}
    />
  );
}
