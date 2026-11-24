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
};

/** Apply one fact learned in the chat, adding the person if they're new. */
export function applyProfileUpdate(family: Person[], u: ProfileUpdate): Person[] {
  const idx = family.findIndex((p) => p.nickname.trim().toLowerCase() === u.personNickname.trim().toLowerCase());
  const base: Person = idx >= 0 ? family[idx] : { id: crypto.randomUUID(), ...EMPTY_PERSON, nickname: u.personNickname };
  const current = base[u.field];
  const merged = ["interests", "dislikes", "notes"].includes(u.field) && current ? `${current}, ${u.value}` : u.value;
  const next = { ...base, [u.field]: merged };
  return idx >= 0 ? family.map((p, i) => (i === idx ? next : p)) : [...family, next];
}
