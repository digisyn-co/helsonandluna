/**
 * Fine gold ornamental line — the recurring motif. Drawn from the centre outward.
 * Paths are split left/right so DrawSVG can grow both halves from the middle diamond.
 */
export function Ornament({ className, id }: { className?: string; id?: string }) {
  return (
    <svg className={className} id={id} viewBox="0 0 320 24" fill="none" aria-hidden="true" data-ornament>
      <defs>
        <linearGradient id="orn-gold" x1="0" x2="320" y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#d4b483" stopOpacity="0" />
          <stop offset="0.3" stopColor="#d4b483" />
          <stop offset="0.5" stopColor="#efdcb7" />
          <stop offset="0.7" stopColor="#d4b483" />
          <stop offset="1" stopColor="#d4b483" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g stroke="url(#orn-gold)" strokeWidth="0.75" strokeLinecap="round">
        <path data-draw d="M152 12 C 146 12, 142 6, 136 6 C 130 6, 128 12, 120 12 L 8 12" />
        <path data-draw d="M168 12 C 174 12, 178 6, 184 6 C 190 6, 192 12, 200 12 L 312 12" />
        <path data-draw d="M136 6 C 132 14, 124 17, 116 17" opacity="0.7" />
        <path data-draw d="M184 6 C 188 14, 196 17, 204 17" opacity="0.7" />
      </g>
      <path data-diamond d="M160 6 L 166 12 L 160 18 L 154 12 Z" fill="#efdcb7" />
    </svg>
  );
}
