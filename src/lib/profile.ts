import { birthYearFrom, normaliseBirthday } from "./birthday";
import type { Person, ProfileUpdate } from "./types";

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
