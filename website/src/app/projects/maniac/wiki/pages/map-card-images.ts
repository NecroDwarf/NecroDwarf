import mansion0 from "../../assets/maps/mansion-640.webp";
import mansion1 from "../../assets/maps/mansion-960.webp";
import pizzeria0 from "../../assets/maps/pizzeria-640.webp";
import pizzeria1 from "../../assets/maps/pizzeria-814.webp";
import fort0 from "../../assets/maps/fort-640.webp";
import fort1 from "../../assets/maps/fort-960.webp";
export const mapCardImages = {
  mansion: {
    src: mansion0,
    srcSet: mansion0 + " 640w" + ", " + mansion1 + " 960w",
    width: 960,
    height: 621,
  },
  pizzeria: {
    src: pizzeria0,
    srcSet: pizzeria0 + " 640w" + ", " + pizzeria1 + " 814w",
    width: 814,
    height: 737,
  },
  fort: {
    src: fort0,
    srcSet: fort0 + " 640w" + ", " + fort1 + " 960w",
    width: 960,
    height: 525,
  },
};
