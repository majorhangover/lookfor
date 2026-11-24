"use client";

import { useState } from "react";
import type { Person } from "@/lib/types";
import { EMPTY_PERSON as EMPTY } from "@/lib/profile";
import { formatBirthday, normaliseBirthday } from "@/lib/birthday";


const FIELDS: { key: keyof Omit<Person, "id">; label: string; placeholder: string }[] = [
  { key: "nickname", label: "Nickname", placeholder: "e.g. Sam (no full names)" },
  { key: "relationship", label: "Relationship", placeholder: "e.g. son, niece, Dad" },
  { key: "age", label: "Age", placeholder: "e.g. 7" },
  { key: "birthday", label: "Birthday", placeholder: "e.g. 24 Nov, or just a month" },
  { key: "interests", label: "Loves", placeholder: "e.g. dinosaurs, Lego, drawing" },
  { key: "dislikes", label: "Not keen on", placeholder: "e.g. loud toys" },
  { key: "sizes", label: "Sizes", placeholder: "e.g. clothes 7-8, shoes 13" },
  { key: "notes", label: "Notes", placeholder: "e.g. already has a scooter" },
];

export default function FamilyPanel({
  family,
  setFamily,
}: {
  family: Person[];
  setFamily: (f: Person[]) => void;
}) {
  const [editing, setEditing] = useState<Person | null>(null);
  const [birthdayError, setBirthdayError] = useState(false);

  const save = () => {
    if (!editing || !editing.nickname.trim()) return;
    const birthday = normaliseBirthday(editing.birthday);
    if (birthday === null) {
      setBirthdayError(true);
      return;
    }
    setBirthdayError(false);
    const person = { ...editing, birthday };
    const exists = family.some((p) => p.id === person.id);
    setFamily(exists ? family.map((p) => (p.id === person.id ? person : p)) : [...family, person]);
    setEditing(null);
  };

  return (
    <section className="rounded-2xl bg-white/90 p-4 shadow-lg text-slate-800">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">My people</h2>
        <button
          className="rounded-full bg-emerald-700 px-3 py-1 text-sm text-white hover:bg-emerald-800"
          onClick={() => setEditing({ id: crypto.randomUUID(), ...EMPTY })}
        >
          + Add person
        </button>
      </div>

      {family.length === 0 && !editing && (
        <p className="text-sm text-slate-500">
          Add the people you&apos;re buying for, or just tell me about them in the chat.
        </p>
      )}

      <ul className="space-y-2">
        {family.map((p) => (
          <li key={p.id} className="flex items-start justify-between rounded-xl bg-slate-50 p-2 text-sm">
            <div>
              <b>{p.nickname}</b>
              {p.relationship && <span className="text-slate-500"> · {p.relationship}</span>}
              {p.age && <span className="text-slate-500"> · {p.age}</span>}
              {p.birthday && <span className="text-slate-500"> · 🎂 {formatBirthday(p.birthday)}</span>}
              {p.interests && <div className="text-slate-600">Loves {p.interests}</div>}
            </div>
            <span className="flex gap-2 shrink-0">
              <button className="text-emerald-700 underline" onClick={() => setEditing({ ...p, birthday: p.birthday ? formatBirthday(p.birthday) : "" })}>
                Edit
              </button>
              <button
                className="text-red-700 underline"
                onClick={() => setFamily(family.filter((x) => x.id !== p.id))}
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>

      {editing && (
        <div className="mt-3 space-y-2 rounded-xl border border-slate-200 p-3">
          {FIELDS.map((f) => (
            <label key={f.key} className="block text-sm">
              <span className="text-slate-600">{f.label}</span>
              <input
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1"
                placeholder={f.placeholder}
                value={editing[f.key]}
                onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
              />
              {f.key === "birthday" && birthdayError && (
                <span className="text-xs text-red-700">Try a date like &quot;24 Nov&quot;, or just the month.</span>
              )}
            </label>
          ))}
          <div className="flex gap-2">
            <button className="rounded bg-emerald-700 px-3 py-1 text-white" onClick={save}>
              Save
            </button>
            <button className="rounded bg-slate-200 px-3 py-1" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {family.length > 0 && (
        <button
          className="mt-3 text-xs text-slate-500 underline"
          onClick={() => {
            if (confirm("Delete everyone from your list on this device?")) setFamily([]);
          }}
        >
          Delete all my data
        </button>
      )}
    </section>
  );
}
