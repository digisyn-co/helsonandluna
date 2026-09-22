/** Gold hairline frame with corner flourishes — the invitation card from the artwork. */
function Flourish({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path d="M1 20 V4 Q1 1 4 1 H20" stroke="currentColor" strokeWidth="1" />
      <path d="M5 26 C5 14 9 9 17 7 C12 11 11 14 13 17 C9 16 7 20 5 26 Z" fill="currentColor" opacity="0.8" />
      <path d="M26 5 C14 5 9 9 7 17 C11 12 14 11 17 13 C16 9 20 7 26 5 Z" fill="currentColor" opacity="0.8" />
      <circle cx="8.5" cy="8.5" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function CardFrame() {
  return (
    <div className="card-frame" aria-hidden="true">
      <Flourish className="tl" />
      <Flourish className="tr" />
      <Flourish className="bl" />
      <Flourish className="br" />
      <span className="mid ml" />
      <span className="mid mr" />
    </div>
  );
}
