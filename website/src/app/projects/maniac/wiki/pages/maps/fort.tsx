import article from "../../data/map-articles/fort.json";
import image0 from "../../../assets/maps/fort-640.webp";
import image1 from "../../../assets/maps/fort-960.webp";
import image2 from "../../../assets/maps/fort-1600.webp";
import { MapArticlePage } from "../MapArticlePage";
const image = {
  src: image2,
  srcSet: image0 + " 640w" + ", " + image1 + " 960w" + ", " + image2 + " 1600w",
  width: 1600,
  height: 875,
};
export default function Page() {
  return <MapArticlePage id="map:fort" article={article} image={image} />;
}
