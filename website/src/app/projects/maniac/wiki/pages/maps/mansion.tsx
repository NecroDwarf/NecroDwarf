import article from "../../data/map-articles/mansion.json";
import image0 from "../../../assets/maps/mansion-640.webp";
import image1 from "../../../assets/maps/mansion-960.webp";
import image2 from "../../../assets/maps/mansion-1261.webp";
import { MapArticlePage } from "../MapArticlePage";
const image = {
  src: image2,
  srcSet: image0 + " 640w" + ", " + image1 + " 960w" + ", " + image2 + " 1261w",
  width: 1261,
  height: 816,
};
export default function Page() {
  return <MapArticlePage id="map:mansion" article={article} image={image} />;
}
