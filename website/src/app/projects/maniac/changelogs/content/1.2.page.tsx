import content from "./1.2.json";
import { ChroniclePage } from "../ChroniclePage";
import type { ChronicleContent } from "./types";
export default function FlowerPage() {
  return <ChroniclePage version="1.2" content={content as ChronicleContent} />;
}
