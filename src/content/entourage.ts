/**
 * The Entourage — supplied by the couple (text.txt, 2026-09-22). Names are reproduced
 * exactly; only label typos were corrected and double spaces collapsed.
 * Primary sponsors keep the two columns and order given (no re-pairing). On the page they come
 * right after the parents, before the best man and maid of honor (the couple, 2026-09-24).
 */
export const entourage = {
  parents: [
    { role: "Parents of the Bride", names: ["Alicia B Tenefrancia", "Fernando T Tenefrancia"] },
    { role: "Parents of the Groom", names: ["Helen P Lamigo", "Wilson A Lamigo"] },
  ],
  honor: [
    { role: "Best Man", names: ["John Lamigo"] },
    { role: "Maid of Honor", names: ["Ma Freda Tribunal"] },
  ],
  party: [
    { role: "Bridesmaids", names: ["Alyssa Nicole Tenefrancia", "Brielle Alizel Tenefrancia", "Ma. Angelica Lauron", "Lizette Jane Lucas"] },
    { role: "Groomsmen", names: ["Joseph Foong", "Juan Paulo Tenefrancia", "Sean Warquin Lamigo", "Isaac Raymon Lucas"] },
    { role: "Junior Bridesmaids", names: ["Shatacia Quinn Sevilla", "Cassie Kelly Infante"] },
    { role: "Junior Groomsmen", names: ["Nicholas Tenefrancia", "Azriel Jaxith Lamigo", "Marcus Yuri Tenefrancia"] },
  ],
  primarySponsors: [
    ["Gina Lamigo Lucas", "Ma. Jeana Fontanillas", "Hilda Maquiling", "Romela Dupit", "Norma Elardo", "Mary Koh", "Minviluz Hojilla", "Josie Galvez"],
    ["Ramon Lucas", "Nemesio Fontanillas", "Edwin Maquiling", "Arnold Dupit", "Philip Elardo", "Leo Elangos", "Nilo Hojilla", "Giovanne Galvez", "Glenda Amor", "Meriam Lamigo"],
  ],
  secondarySponsors: [
    { role: "Cord", names: ["Jay Van Tenefrancia & Giselle May Tenefrancia"] },
    { role: "Candle", names: ["Kenn Raymir Tenefrancia & Krisanteen Maquiling"] },
    { role: "Veil", names: ["Herbert Gajo & Christine Joy Gajo"] },
  ],
  bearers: [
    { role: "Flower Girls", names: ["Aislah Fayre Gajo", "Kaelsley Ember Infante"] },
    { role: "Ring Bearer", names: ["Noah Tenefrancia"] },
    { role: "Bible Bearer", names: ["Christoffer Eli Gajo"] },
    { role: "Coin Bearer", names: ["Cirgel Juaquin Principe"] },
  ],
} as const;
