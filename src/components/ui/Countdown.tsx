"use client";

import { useEffect, useState } from "react";
import { wedding } from "@/content/wedding";

const TARGET = new Date(wedding.countdownISO).getTime();

function parts(now: number) {
  const ms = Math.max(0, TARGET - now);
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    minutes: Math.floor(ms / 60_000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  };
}

/** Live countdown. Renders "—" on the server so the markup never mismatches. */
export function Countdown({ className }: { className?: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000); // a clock, not choreography
    return () => clearInterval(id);
  }, []);

  const p = now === null ? null : parts(now);
  const cells = [
    ["days", "Days"],
    ["hours", "Hours"],
    ["minutes", "Minutes"],
    ["seconds", "Seconds"],
  ] as const;

  return (
    <div className={className} role="timer" aria-label={p ? `${p.days} days until the wedding` : "Countdown to the wedding"}>
      {cells.map(([k, label]) => (
        <div key={k}>
          <span aria-hidden="true">{p ? String(p[k]).padStart(2, "0") : "—"}</span>
          <small aria-hidden="true">{label}</small>
        </div>
      ))}
    </div>
  );
}
