/**
 * Gold line-art architecture: an arched facade with a rose window, drawn as ornament.
 * Deliberately NOT a picture of the real venue (no photo of it exists yet — see
 * docs/assets.md); it evokes "a church" without claiming to be St. Clement's.
 */
export function Architecture({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 360" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="arch-gold" x1="0" y1="0" x2="0" y2="360" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#efdcb7" />
          <stop offset="0.6" stopColor="#d4b483" />
          <stop offset="1" stopColor="#a8844e" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <g stroke="url(#arch-gold)" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Facade and gable */}
        <path data-draw d="M40 350 V150 L150 60 L260 150 V350" />
        <path data-draw d="M150 60 V28 M140 38 H160" />
        {/* Rose window */}
        <circle data-draw cx="150" cy="130" r="26" />
        <circle data-draw cx="150" cy="130" r="9" />
        {[0, 45, 90, 135].map((a) => (
          <path key={a} data-draw d="M124 130 H176" transform={`rotate(${a} 150 130)`} />
        ))}
        {/* Three arches */}
        <path data-draw d="M118 350 V250 A32 32 0 0 1 182 250 V350" />
        <path data-draw d="M60 350 V270 A20 20 0 0 1 100 270 V350" />
        <path data-draw d="M200 350 V270 A20 20 0 0 1 240 270 V350" />
        {/* Steps */}
        <path data-draw d="M20 350 H280 M30 342 H270" />
      </g>
    </svg>
  );
}
