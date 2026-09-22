"use client";

import { useRef } from "react";
import { entourage } from "@/content/entourage";
import { useScene } from "@/animation/useScene";
import { Chapter } from "@/components/cinematic/Chapter";
import { Ornament } from "@/components/cinematic/Ornament";
import s from "./entourage.module.css";

type Group = { readonly role: string; readonly names: readonly string[] };

function Role({ group }: { group: Group }) {
  return (
    <div className={s.role}>
      <h3 className="meta">{group.role}</h3>
      <ul>
        {group.names.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The Entourage — the people who stand with the couple. A readable, calm chapter
 * (like Details): every name is always visible, never gated by animation.
 */
export function Entourage() {
  const root = useRef<HTMLElement>(null);
  useScene("entourage", root);
  const [bridesmaids, groomsmen, juniorBridesmaids, juniorGroomsmen] = entourage.party;

  return (
    <Chapter ref={root} id="entourage" label="The entourage" pinned={false} pinClassName={s.flow}>
      <header className={s.header}>
        <p className="meta">With the blessing of</p>
        <h2 className={`display ${s.title}`}>
          The <em>Entourage</em>
        </h2>
      </header>

      <div className={s.pair}>
        {entourage.parents.map((g) => (
          <Role key={g.role} group={g} />
        ))}
      </div>

      <Ornament className={s.ornament} />

      <div className={s.pair}>
        {entourage.honor.map((g) => (
          <Role key={g.role} group={g} />
        ))}
      </div>

      <div className={s.pair}>
        <Role group={bridesmaids} />
        <Role group={groomsmen} />
      </div>
      <div className={s.pair}>
        <Role group={juniorBridesmaids} />
        <Role group={juniorGroomsmen} />
      </div>

      <Ornament className={s.ornament} />

      <section className={s.block} aria-labelledby="primary-sponsors">
        <h3 id="primary-sponsors" className="meta">
          Primary Sponsors
        </h3>
        <div className={s.pair}>
          {entourage.primarySponsors.map((col, i) => (
            <ul key={i} className={s.column}>
              {col.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          ))}
        </div>
      </section>

      <section className={s.block} aria-labelledby="secondary-sponsors">
        <h3 id="secondary-sponsors" className="meta">
          Secondary Sponsors
        </h3>
        <div className={s.stack}>
          {entourage.secondarySponsors.map((g) => (
            <Role key={g.role} group={g} />
          ))}
        </div>
      </section>

      <Ornament className={s.ornament} />

      <div className={s.grid}>
        {entourage.bearers.map((g) => (
          <Role key={g.role} group={g} />
        ))}
      </div>
    </Chapter>
  );
}
