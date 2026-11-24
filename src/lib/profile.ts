import { birthYearFrom, normaliseBirthday } from "./birthday";
import type { GiftIdea, Person, ProfileUpdate } from "./types";

export const EMPTY_PERSON: Omit<Person, "id"> = {
  nickname: "",
  relationship: "",
  age: "",
  birthday: "",
  interests: "",
  dislikes: "",
  sizes: "",
  notes: "",
  budget: "",
  birthYear: "",
};

/** Apply one fact learned in the chat, adding the person if they're new. */
export function applyProfileUpdate(family: Person[], u: ProfileUpdate): Person[] {
  const idx = family.findIndex((p) => p.nickname.trim().toLowerCase() === u.personNickname.trim().toLowerCase());
  const base: Person = idx >= 0 ? family[idx] : { id: crypto.randomUUID(), ...EMPTY_PERSON, nickname: u.personNickname };
  let extra: Partial<Person> = {};
  if (u.field === "birthday") {
    // Store a real date; if it can't be understood, keep it as a note instead.
    const birthday = normaliseBirthday(u.value);
    if (birthday === null) u = { ...u, field: "notes", value: `birthday ${u.value}` };
    else {
      const year = birthYearFrom(u.value);
      if (year) extra = { birthYear: year };
      u = { ...u, value: birthday };
    }
  }
  const current = base[u.field];
  const merged = ["interests", "dislikes", "notes"].includes(u.field) && current ? `${current}, ${u.value}` : u.value;
  const next = { ...base, ...extra, [u.field]: merged };
  return idx >= 0 ? family.map((p, i) => (i === idx ? next : p)) : [...family, next];
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** The saved person a gift idea is for, matched on their name. */
export function personFor(family: Person[], forPerson: string): Person | undefined {
  return family.find((p) => same(p.nickname, forPerson));
}

export function isSaved(family: Person[], g: GiftIdea): boolean {
  return Boolean(personFor(family, g.forPerson)?.savedGifts?.some((s) => same(s.title, g.title)));
}

/** Save a gift idea against the person it's for (adding them if new), or unsave it if already saved. */
export function toggleSavedGift(family: Person[], g: GiftIdea, occasion: string): Person[] {
  const existing = personFor(family, g.forPerson);
  const person: Person = existing ?? { id: crypto.randomUUID(), ...EMPTY_PERSON, nickname: g.forPerson.trim() };
  const saved = person.savedGifts ?? [];
  const next: Person = saved.some((s) => same(s.title, g.title))
    ? { ...person, savedGifts: saved.filter((s) => !same(s.title, g.title)) }
    : {
        ...person,
        savedGifts: [
          ...saved,
          { title: g.title, url: g.url, priceBand: g.priceBand, reason: g.reason, occasion, savedAt: new Date().toISOString() },
        ],
      };
  return existing ? family.map((p) => (p.id === person.id ? next : p)) : [...family, next];
}
