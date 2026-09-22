# Helson & Luna — Content (single source of truth)

Extracted verbatim from the live site (https://helson-and-luna.vercel.app/, byte-identical to `index.html` on `main` at commit `b3f452b`) on 2026-09-22.
**Rule:** code must render these facts only from `src/content/`, which mirrors this file. Anything unresolved is marked `TODO(content)` and must not be guessed.

## Core facts

| Field | Value on the live site | Status |
|---|---|---|
| Names (display order) | **HELSON & LUNA** (hero, closing: "HELSON + LUNA") | ⚠ Conflicts with the monogram artwork, which reads **"LUNA & HELSON"** (see Conflicts) |
| Date | **Thursday, December 17, 2026** (also "17 · 12 · 26" and "DECEMBER 17 — 2026") | ✔ Weekday verified (Dec 17, 2026 is a Thursday). ⚠ The monogram artwork reads **"12·17·2024"** |
| City | Iloilo City, Philippines | ✔ |
| Theme line | "Ethereal of the Garden Sky" / "Garden Sky" / "Until the garden sky" | ✔ (copy as-is) |
| Closing quote | "And now, forever begins." | ✔ |

## Ceremony
| Field | Value | Status |
|---|---|---|
| Venue | **St. Clements Church** | ⚠ The map link on the same page searches **"St. Clement Church"** (singular). Confirm the official spelling. `TODO(content)` |
| Address | La Paz, Iloilo City, Philippines | ✔ |
| Date | Thursday, December 17, 2026 | ✔ |
| Time | **"To be confirmed"** | `TODO(content)`: ceremony start time |
| Map | Google Maps search: `St. Clement Church La Paz Iloilo City` | ✔ (keep the link; update if the spelling changes) |
| Coordinates shown | 10.7215° N, 122.5630° E | ⚠ Displayed but not verified against the venue. `TODO(content)`: confirm, or drop the coordinates |

## Reception
| Field | Value | Status |
|---|---|---|
| Venue | **Diversion 21 Hotel** | ✔ |
| Address | Iloilo City, Philippines | ✔ (no street address on the site) |
| Description | "Dinner and dancing to follow the ceremony." | ✔ |
| Time | "Evening" (no clock time) | `TODO(content)`: reception time, if a precise time is wanted |
| Mood labels | "Evening", "Candlelight" | ✔ (decorative) |

## Guest details
| Field | Value | Status |
|---|---|---|
| Attire | "Formal garden palette" (ceremony block) and "Garden formal" (RSVP block) | Minor wording difference. Use "Garden formal" as the label and "Formal garden palette" as the description, unless told otherwise |
| Guests | "Adults only" | ✔ |
| RSVP deadline | **October 31, 2026** ("Kindly respond by October 31, 2026 so we can hold a seat for you in the garden.") | ✔ |
| RSVP method | `mailto:rsvp@helsonandluna.com` (subject "RSVP — Helson & Luna, Dec 17 2026") | ❌ **Broken.** `helsonandluna.com` has **no DNS records at all** (no MX, no A) as of 2026-09-22, so every RSVP email bounces. `TODO(content)`: working RSVP method |
| Contact | "Questions? Write to us anytime." (same mailto) | ❌ Same broken address. `TODO(content)` |
| Countdown | Live days / hours / minutes / seconds, targeting **`2026-12-17T14:00:00+08:00`** (2:00 PM Manila) in the previous site's code | ⚠ Contradicts the ceremony time "To be confirmed". The countdown keeps this target, but 2:00 PM is never displayed as the ceremony time. `TODO(content)`: confirm the ceremony time and the countdown target |

## Entourage (added 2026-09-22, from the couple's text.txt)
Rendered from `src/content/entourage.ts`, shown before the Ceremony as "The Entourage".
- **Parents of the Bride:** Alicia B Tenefrancia, Fernando T Tenefrancia
- **Parents of the Groom:** Helen P Lamigo, Wilson A Lamigo
- **Best Man:** John Lamigo. **Maid of Honor:** Ma Freda Tribunal
- **Bridesmaids:** Alyssa Nicole Tenefrancia, Brielle Alizel Tenefrancia, Ma. Angelica Lauron, Lizette Jane Lucas
- **Groomsmen:** Joseph Foong, Juan Paulo Tenefrancia, Sean Warquin Lamigo, Isaac Raymon Lucas
- **Junior Bridesmaids:** Shatacia Quinn Sevilla, Cassie Kelly Infante
- **Junior Groomsmen:** Nicholas Tenefrancia, Azriel Jaxith Lamigo, Marcus Yuri Tenefrancia
- **Primary Sponsors** (two columns, order as supplied, not re-paired):
  - Column 1: Gina Lamigo Lucas, Ma. Jeana Fontanillas, Hilda Maquiling, Romela Dupit, Norma Elardo, Mary Koh, Minviluz Hojilla, Josie Galvez
  - Column 2: Ramon Lucas, Nemesio Fontanillas, Edwin Maquiling, Arnold Dupit, Philip Elardo, Leo Elangos, Nilo Hojilla, Giovanne Galvez, Glenda Amor, Meriam Lamigo
- **Secondary Sponsors:** Cord, Jay Van Tenefrancia & Giselle May Tenefrancia · Candle, Kenn Raymir Tenefrancia & Krisanteen Maquiling · Veil, Herbert Gajo & Christine Joy Gajo
- **Flower Girls:** Aislah Fayre Gajo, Kaelsley Ember Infante · **Ring Bearer:** Noah Tenefrancia · **Bible Bearer:** Christoffer Eli Gajo · **Coin Bearer:** Cirgel Juaquin Principe

Corrections made: label typos only ("Bestman", "brisdesmaid", "Coin beare"); double spaces in "Lizette Jane Lucas" and "Romela Dupit". `TODO(content)`: please double-check the spellings of "Shatacia" and "Kaelsley".

## Story copy (keep, may be lightly re-sequenced per scene)
- **Their Story:** "Two lives. One beautiful story." / "Two people who found each other in the ordinary hours — a shared table, a long afternoon, a garden with the light going gold. In December they will stand together in Iloilo and make it permanent."
- **Family:** "Before the wedding, there was a life already filled with love." / "The smallest pair of shoes, kept all these years." / "A daughter, a home, a decade of ordinary mornings. The wedding is not the beginning of the story. It is the vow written over one already lived."
- **The Journey:** "Memories, floating through a garden." / "A few of the years that brought them here." Captions: "The long walk — Three of them, one road, no hurry at all." · "Afternoons, unhurried" · "Iloilo — Everything quiet has been leading here." · "The three of us — A family before it was a wedding party." · "Two rings, waiting"
- **The Wedding:** "THE DAY WE SAY I DO"
- **RSVP:** "WE'D LOVE TO CELEBRATE with you."

## Decisions (2026-09-22)
- **Name order and date:** the site is correct, **Helson & Luna, December 17, 2026** (confirmed again 2026-09-22).
- **Monogram:** now the transparent "HELSON & LUNA" artwork from the August site (digisyn-co/helsonandluna), used exactly as drawn. Only its printed text line is cropped off; that line's date reads **"12.12 2026"**, which is wrong. Names and date are set as live type. The older blue monogram ("LUNA & HELSON · 12·17·2024") is no longer used.
- **Photos:** real couple photos from the August site (beach, coast) now appear in "The Two of Us", and its family selfie replaces the AI baby-shoes image in "Family". All old-site photos (AI stand-ins, screenshots, the old blue monogram) were removed; the "smallest pair of shoes" line is no longer shown.
- **RSVP:** a form built into the site replaces the dead email address. Delivery target: `TODO(content)`, see the report.
- **Photos:** only the real photo shoot is used for people; AI imagery is limited to objects (the baby shoes).

## Still open
1. **Venue spelling:** "St. Clements" vs "St. Clement". `TODO(content)`
2. **Ceremony time:** "To be confirmed" (and the countdown's 2:00 PM target). `TODO(content)`
3. **Reception time:** only "Evening". `TODO(content)`
4. **Coordinates:** 10.7215° N, 122.5630° E, unverified. They're not shown on the new site. `TODO(content)`
5. **Contact:** "Questions? Write to us anytime." had no working address. `TODO(content)`
6. **RSVP deadline:** the August site said "RSVP by November 17, 2026"; the September site (used here) says **October 31, 2026**. `TODO(content)`: confirm
