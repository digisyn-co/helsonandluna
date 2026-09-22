import { forwardRef } from "react";
import { monogram } from "@/content/images";

/**
 * The monogram, exactly as drawn (transparent artwork, pixels untouched; only its printed
 * text line is cropped away — see docs/content.md). Motion happens AROUND and ON it:
 *  - `.monogram__sweep`: a masked light band that travels across the gold (blend-mode pass)
 *  - `.monogram__glint`: tiny star glints placed over the two crystal clusters
 */
export const Monogram = forwardRef<HTMLDivElement, { size?: "hero" | "loader" | "closing"; priority?: boolean }>(
  function Monogram({ size = "hero", priority = false }, ref) {
    const src = (ext: string) => monogram.widths.map((w) => `/images/monogram-${w}.${ext} ${w}w`).join(", ");
    const sizes = size === "loader" ? "160px" : "(max-width: 640px) 86vw, 520px";
    return (
      <div ref={ref} className={`monogram monogram--${size}`}>
        <picture>
          <source type="image/avif" srcSet={src("avif")} sizes={sizes} />
          <source type="image/webp" srcSet={src("webp")} sizes={sizes} />
          <img
            src="/images/monogram-640.webp"
            alt={monogram.alt}
            width={monogram.width}
            height={monogram.height}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
          />
        </picture>
        {size !== "loader" && (
          <>
            <span className="monogram__sweep" aria-hidden="true" />
            {/* Crystal cluster positions measured on the cropped artwork (percent of width/height). */}
            <span className="monogram__glint" style={{ left: "16%", top: "41%" }} aria-hidden="true" />
            <span className="monogram__glint" style={{ left: "83%", top: "42%" }} aria-hidden="true" />
            <span className="monogram__glint monogram__glint--small" style={{ left: "50%", top: "92%" }} aria-hidden="true" />
          </>
        )}
      </div>
    );
  },
);
