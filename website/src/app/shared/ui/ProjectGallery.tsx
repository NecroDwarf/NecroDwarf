import type { ProjectImage } from "../content/types";
import s from "./ProjectIntro.module.css";

export function ProjectGallery({
  images,
}: {
  images?: readonly ProjectImage[];
}) {
  if (!images?.length) return null;
  return (
    <div className={s.gallery}>
      {images.map((image) => (
        <figure key={image.src}>
          <img
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
            decoding="async"
          />
          {image.caption && <figcaption>{image.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}
