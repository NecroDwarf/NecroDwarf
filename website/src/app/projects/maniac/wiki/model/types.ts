export interface CharacterModel {
  id: string;
  src: string;
  label: string;
  cameraDirection: readonly [number, number, number];
  // GLB is a static bind pose. No alternative forms or fake animation clips.
  animationSupport: "static";
}
