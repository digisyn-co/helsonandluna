/**
 * Wedding facts — mirrors docs/content.md (the single source of truth).
 * Never add a fact here that isn't in that file. Unknowns stay `null` and render
 * as nothing (or a neutral "to be announced"), never as a guess.
 */

export const couple = {
  /** Display order confirmed by the couple (2026-09-22): site order, not the artwork's. */
  first: "Helson",
  second: "Luna",
  joined: "Helson & Luna",
} as const;

export const wedding = {
  /** Ceremony day, Asia/Manila. Countdown target uses the ceremony time once known. */
  dateISO: "2026-12-17",
  /** Ceremony start, 2:30 PM Manila (confirmed 2026-09-22). */
  countdownISO: "2026-12-17T14:30:00+08:00",
  timeZone: "Asia/Manila",
  dateLong: "Thursday, December 17, 2026",
  dateShort: "December 17, 2026",
  dateNumeric: "17 · 12 · 26",
  city: "Iloilo City",
  country: "Philippines",
  /** Theme name (the couple, 2026-09-24: "Crystal Sky", previously "Garden Sky"). */
  theme: "Ethereal of the Crystal Sky",
  /** Short form, signed under the closing. */
  themeShort: "Crystal Sky",
  quote: "And now, forever begins.",
} as const;

export const ceremony = {
  // TODO(content): confirm spelling — site shows "St. Clements", its map link searches "St. Clement".
  venue: "St. Clements Church",
  area: "La Paz, Iloilo City",
  country: "Philippines",
  date: "Thursday, December 17, 2026",
  /** Confirmed 2026-09-22. */
  time: "2:30 PM" as string | null,
  /** Wording the current site uses while the time is unknown. */
  timePending: "To be confirmed",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=St.+Clement+Church+La+Paz+Iloilo+City",
} as const;

export const reception = {
  venue: "Diversion 21 Hotel",
  area: "Iloilo City",
  country: "Philippines",
  description: "Dinner and dancing to follow the ceremony.",
  // TODO(content): reception clock time — the current site only says "Evening".
  time: null as string | null,
  timeLabel: "Evening",
} as const;

export const details = {
  attire: "Garden formal",
  attireNote: "Formal garden palette",
  guests: "Adults only",
  rsvpBy: "October 31, 2026",
  rsvpByISO: "2026-10-31",
  rsvpNote: "Kindly respond by October 31, 2026 so we can hold a seat for you in the garden.",
} as const;

export const story = {
  beginning: {
    title: ["Two lives.", "One beautiful story."],
    body: "Two people who found each other in the ordinary hours — a shared table, a long afternoon, a garden with the light going gold. In December they will stand together in Iloilo and make it permanent.",
  },
  family: {
    title: ["Before the wedding,", "there was a life already filled with love."],
    shoes: "The smallest pair of shoes, kept all these years.",
    body: "A daughter, a home, a decade of ordinary mornings. The wedding is not the beginning of the story. It is the vow written over one already lived.",
  },
  journey: {
    title: ["Memories,", "floating through a garden."],
    subtitle: "A few of the years that brought them here.",
    captions: {
      walk: { title: "The long walk", body: "Three of them, one road, no hurry at all." },
      afternoons: { title: "Afternoons, unhurried", body: "" },
      iloilo: { title: "Iloilo", body: "Everything quiet has been leading here." },
      three: { title: "The three of us", body: "A family before it was a wedding party." },
      rings: { title: "Two rings, waiting", body: "" },
    },
  },
  wedding: { title: ["The day we say", "I do"] },
  rsvp: { title: ["We'd love to celebrate", "with you."] },
} as const;
