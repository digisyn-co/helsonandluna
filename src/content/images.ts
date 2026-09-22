/**
 * Web images produced by `pnpm images` (scripts/build-images.sh) from the original shoot.
 * `focus` is the CSS object-position that keeps faces in frame on portrait phones
 * (measured per photo, see docs/assets.md).
 * Alt text describes what is visible; it never assigns names to people (not in content.md).
 */
export type Photo = {
  name: string;
  alt: string;
  width: number;
  height: number;
  focus: string;
};

const P = (name: string, alt: string, orientation: "portrait" | "landscape", focus: string): Photo => ({
  name,
  alt,
  width: orientation === "portrait" ? 6336 : 9504,
  height: orientation === "portrait" ? 9504 : 6336,
  focus,
});

export const photos = {
  walkAway: P("walk-away", "A mother and daughter walking hand in hand down a sunlit trail", "portrait", "50% 70%"),
  turnedTogether: P("turned-together", "The couple turned toward each other, their daughter between them", "landscape", "42% 30%"),
  kneelingCandid: P("kneeling-candid", "The family kneeling together on the trail, laughing", "landscape", "40% 30%"),
  familyKneeling: P("family-kneeling", "The couple and their daughter kneeling together, smiling", "portrait", "50% 34%"),
  fatherDaughter: P("father-daughter-hug", "A father hugging his daughter on a golden trail", "portrait", "50% 38%"),
  motherDaughter: P("mother-daughter-embrace", "A mother embracing her daughter", "portrait", "50% 36%"),
  daughterLaughing: P("daughter-laughing", "A little girl laughing, holding her mother's hands", "portrait", "55% 32%"),
  familyLaughing: P("family-laughing", "The family laughing together on the rocks", "landscape", "55% 45%"),
  twirl: P("twirl", "A little girl twirling in a pink tulle dress", "portrait", "50% 50%"),
  familyBacklit: P("family-backlit", "The family standing under tall trees at golden hour", "portrait", "50% 78%"),
  // Real couple photos from the August site (digisyn-co/helsonandluna).
  coupleBeach: { name: "couple-beach", alt: "The couple laughing on a beach, one carrying the other piggyback", width: 1440, height: 1800, focus: "50% 22%" },
  coupleCoast: { name: "couple-coast", alt: "The couple standing together on a sunny coastal path", width: 1440, height: 1080, focus: "55% 45%" },
  familyMeadow: { name: "family-meadow", alt: "The couple and their daughter sitting in a sunlit meadow with a basket of flowers", width: 1536, height: 1024, focus: "50% 40%" },
  familySelfie: { name: "family-selfie", alt: "A family selfie: the couple smiling with their daughter as a toddler in a sun hat", width: 960, height: 720, focus: "50% 45%" },
} satisfies Record<string, Photo>;

export const monogram = {
  name: "monogram",
  alt: "The Helson and Luna monogram: a gold H and L inside an ornate oval frame with crystals and roses",
  width: 931,
  height: 822,
  widths: [320, 640, 931],
} as const;

export const PHOTO_WIDTHS = [640, 960, 1440, 2048] as const;
