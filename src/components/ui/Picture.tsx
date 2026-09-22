import type { CSSProperties } from "react";
import { PHOTO_WIDTHS, type Photo } from "@/content/images";

type Props = {
  photo: Photo;
  /** Layout hint for the browser's srcset choice, e.g. "(max-width: 640px) 100vw, 50vw". */
  sizes?: string;
  className?: string;
  style?: CSSProperties;
  /** Above-the-fold images load eagerly with high priority. */
  priority?: boolean;
  /** Override the photo's default focal point for this placement. */
  focus?: string;
};

const set = (name: string, ext: string) => PHOTO_WIDTHS.map((w) => `/images/${name}-${w}.${ext} ${w}w`).join(", ");

/** Responsive AVIF/WebP picture with an intentional focal point (faces stay in frame). */
export function Picture({ photo, sizes = "100vw", className, style, priority = false, focus }: Props) {
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={set(photo.name, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set(photo.name, "webp")} sizes={sizes} />
      <img
        src={`/images/${photo.name}-960.webp`}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        style={{ objectPosition: focus ?? photo.focus, ...style }}
      />
    </picture>
  );
}
