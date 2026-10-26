import { readFile } from "node:fs/promises";
import { convertBedrock } from "./convert-maniac-model.mjs";

const folder = "src/app/projects/maniac/assets/models/nightmare-lighter";
const animation = JSON.parse(
  await readFile(`${folder}/source/nightmare_lighter.animation.json`, "utf8"),
);
// Freeze the final numeric keyframes of the original opening animation.
const opening = animation.animations.animation;
const bones = Object.fromEntries(
  Object.entries(opening.bones).map(([name, channels]) => [
    name,
    Object.fromEntries(
      Object.entries(channels).map(([channel, keyframes]) => {
        const sample = keyframes.vector
          ? keyframes
          : Object.entries(keyframes)
              .sort(([a], [b]) => Number(a) - Number(b))
              .at(-1)[1];
        return [channel, sample];
      }),
    ),
  ]),
);
await convertBedrock({
  folder,
  basename: "nightmare_lighter",
  textureFile: "nightmare-lighter.png",
  label: "Кошмарная зажигалка — открыта",
  pose: {
    bones,
    label: `original opening animation at ${opening.animation_length}s`,
  },
});
