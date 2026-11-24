"use client";

import { useState } from "react";
import type { Person, ProfileUpdate } from "@/lib/types";

const EMPTY: Omit<Person, "id"> = {
  nickname: "",
  relationship: "",
  age: "",
  birthday: "",
  interests: "",
  dislikes: "",
  sizes: "",
  notes: "",
};

const FIELDS: { key: keyof Omit<Person, "id">; label: string; placeholder: string }[] = [
  { key: "nickname", label: "Nickname", placeholder: "e.g. Sam (no full names)" },
  { key: "relationship", label: "Relationship", placeholder: "e.g. son, niece, Dad" },
  { key: "age", label: "Age", placeholder: "e.g. 7" },
  { key: "birthday", label: "Birthday month", placeholder: "e.g. 2019-03" },
  { key: "interests", label: "Loves", placeholder: "e.g. dinosaurs, Lego, drawing" },
  { key: "dislikes", label: "Not keen on", placeholder: "e.g. loud toys" },
  { key: "sizes", label: "Sizes", placeholder: "e.g. clothes 7-8, shoes 13" },
  { key: "notes", label: "Notes", placeholder: "e.g. already has a scooter" },
];

export default function FamilyPanel({
  family,
  setFamily,
  pending,
  setPending,
}: {
  family: Person[];
  setFamily: (f: Person[]) => void;
  pending: ProfileUpdate[];
  setPending: (p: ProfileUpdate[]) => void;
}) {
  const [editing, setEditing] = useState<Person | null>(null);

  const save = () => {
    if (!editing || !editing.nickname.trim()) return;
    const exists = family.some((p) => p.id === editing.id);
    setFamily(exists ? family.map((p) => (p.id === editing.id ? editing : p)) : [...family, editing]);
    setEditing(null);
  };

  const applyUpdate = (u: ProfileUpdate) => {
    const idx = family.findIndex((p) => p.nickname.toLowerCase() === u.personNickname.toLowerCase());
    const base: Person = idx >= 0 ? family[idx] : { id: crypto.randomUUID(), ...EMPTY, nickname: u.personNickname };
    const current = base[u.field];
    const merged =
      ["interests", "dislikes", "notes"].includes(u.field) && current ? `${current}, ${u.value}` : u.value;
    const next = { ...base, [u.field]: merged };
    setFamily(idx >= 0 ? family.map((p, i) => (i === idx ? next : p)) : [...family, next]);
    setPending(pending.filter((p) => p !== u));
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

      {pending.length > 0 && (
        <div className="mb-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm">
          <p className="font-semibold mb-1">Noted from your chat. Save them?</p>
          {pending.map((u, i) => (
            <div key={i} className="flex items-center justify-between gap-2 py-1">
              <span>
                {u.isNewPerson ? "New: " : ""}
                <b>{u.personNickname}</b> {u.field}: {u.value}
              </span>
              <span className="flex gap-1 shrink-0">
                <button className="rounded bg-emerald-700 px-2 text-white" onClick={() => applyUpdate(u)}>
                  Save
                </button>
                <button className="rounded bg-slate-200 px-2" onClick={() => setPending(pending.filter((p) => p !== u))}>
                  Skip
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {family.length === 0 && !editing && (
        <p className="text-sm text-slate-500">
          Add the people you&apos;re buying for, or just mention them in the chat and we&apos;ll offer to remember.
        </p>
      )}

      <ul className="space-y-2">
        {family.map((p) => (
          <li key={p.id} className="flex items-start justify-between rounded-xl bg-slate-50 p-2 text-sm">
            <div>
              <b>{p.nickname}</b>
              {p.relationship && <span className="text-slate-500"> · {p.relationship}</span>}
              {p.age && <span className="text-slate-500"> · {p.age}</span>}
              {p.interests && <div className="text-slate-600">Loves {p.interests}</div>}
            </div>
            <span className="flex gap-2 shrink-0">
              <button className="text-emerald-700 underline" onClick={() => setEditing(p)}>
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
