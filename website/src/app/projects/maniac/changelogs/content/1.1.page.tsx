import content from "./1.1.json";
import { ChroniclePage } from "../ChroniclePage";
import type { ChronicleContent } from "./types";
export default function NightmarePage() {
  return <ChroniclePage version="1.1" content={content as ChronicleContent} />;
}
