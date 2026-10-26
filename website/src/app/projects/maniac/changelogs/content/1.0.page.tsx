import content from "./1.0.json";
import { ChroniclePage } from "../ChroniclePage";
import type { ChronicleContent } from "./types";
export default function ReforgePage() {
  return <ChroniclePage version="1.0" content={content as ChronicleContent} />;
}
