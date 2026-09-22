/**
 * Soft floral silhouettes for the frame edges (the recurring floral motif).
 * Drawn as quiet line-and-petal sprigs — atmosphere, never decoration-heavy.
 */
function Sprig() {
  return (
    <g>
      <path d="M40 300 C 46 240, 38 180, 58 120 C 70 84, 64 50, 80 18" stroke="#d4b483" strokeWidth="0.8" fill="none" opacity="0.7" />
      {[
        [52, 250, -30], [44, 205, 25], [56, 165, -35], [60, 128, 30], [70, 92, -25], [72, 60, 28],
      ].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx="13" ry="4.5" transform={`rotate(${r} ${x} ${y})`} fill="#a9b4d8" opacity="0.35" />
      ))}
      {[
        [80, 18, 7], [66, 70, 5], [48, 150, 6], [58, 218, 4.5],
      ].map(([x, y, s], i) => (
        <g key={`b${i}`} transform={`translate(${x} ${y})`} opacity="0.75">
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy={-s} rx={s * 0.55} ry={s} transform={`rotate(${a})`} fill="#e7c2c1" opacity="0.55" />
          ))}
          <circle r={s * 0.28} fill="#efdcb7" />
        </g>
      ))}
    </g>
  );
}

export function Florals({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <svg data-floral="left" viewBox="0 0 120 320" width="120" height="320">
        <Sprig />
      </svg>
      <svg data-floral="right" viewBox="0 0 120 320" width="120" height="320" style={{ transform: "scaleX(-1)" }}>
        <Sprig />
      </svg>
    </div>
  );
}
