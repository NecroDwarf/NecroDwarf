import article from "../../data/map-articles/pizzeria.json";
import image0 from "../../../assets/maps/pizzeria-640.webp";
import image1 from "../../../assets/maps/pizzeria-814.webp";
import { MapArticlePage } from "../MapArticlePage";
const image = {
  src: image1,
  srcSet: image0 + " 640w" + ", " + image1 + " 814w",
  width: 814,
  height: 737,
};
export default function Page() {
  return <MapArticlePage id="map:pizzeria" article={article} image={image} />;
}
