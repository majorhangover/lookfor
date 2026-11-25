"use client";

import { useRef, useState } from "react";
import type { Person } from "@/lib/types";
import Face, { type FaceId } from "./Face";
import { faceFor } from "@/lib/faceFor";
import { EMPTY_PERSON as EMPTY } from "@/lib/profile";
import { birthYearFrom, displayAge, formatBirthday, normaliseBirthday } from "@/lib/birthday";

type Field = { key: keyof Omit<Person, "id" | "birthYear" | "savedGifts">; label: string; placeholder: string };

/** The few things that make the biggest difference to gift ideas. */
const QUICK: Field[] = [
  { key: "nickname", label: "Name", placeholder: "e.g. Sam, Mum, Grandad (first names only)" },
  { key: "birthday", label: "Date of birth", placeholder: "e.g. 24/11/2015, or just 24 Nov" },
  { key: "interests", label: "Likes", placeholder: "e.g. dinosaurs, Lego, drawing" },
  { key: "budget", label: "Budget", placeholder: "e.g. 30" },
];

const MORE: Field[] = [
  { key: "relationship", label: "Relationship", placeholder: "e.g. son, niece, best friend" },
  { key: "age", label: "Age (if you don't know the year of birth)", placeholder: "e.g. 7" },
  { key: "dislikes", label: "Not keen on", placeholder: "e.g. loud toys" },
  { key: "sizes", label: "Sizes", placeholder: "e.g. clothes 7-8, shoes 13" },
  { key: "notes", label: "Notes", placeholder: "e.g. already has a scooter" },
];

const blank = (): Person => ({ id: crypto.randomUUID(), ...EMPTY });

export default function FamilyPanel({
  family,
  setFamily,
  currency = "£",
}: {
  family: Person[];
  setFamily: (f: Person[]) => void;
  currency?: string;
}) {
  const [editing, setEditing] = useState<Person | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [birthdayError, setBirthdayError] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const nameInput = useRef<HTMLInputElement>(null);

  const start = (p: Person | null) => {
    setEditing(p);
    setBirthdayError(false);
    setShowMore(false);
    setJustAdded(null);
    if (p) setTimeout(() => nameInput.current?.focus(), 0);
  };

  const save = (addAnother: boolean) => {
    if (!editing || !editing.nickname.trim()) {
      nameInput.current?.focus();
      return;
    }
    const birthday = normaliseBirthday(editing.birthday ?? "");
    if (birthday === null) {
      setBirthdayError(true);
      return;
    }
    let budget = (editing.budget ?? "").trim();
    if (/^\d/.test(budget)) budget = currency + budget;
    const person: Person = {
      ...editing,
      nickname: editing.nickname.trim(),
      birthday,
      birthYear: birthday ? birthYearFrom(editing.birthday) : "",
      budget,
    };
    const exists = family.some((p) => p.id === person.id);
    setFamily(exists ? family.map((p) => (p.id === person.id ? person : p)) : [...family, person]);
    if (addAnother) {
      start(blank());
      setJustAdded(person.nickname);
    } else {
      start(null);
    }
  };

  const input = (f: Field, first = false) => (
    <label key={f.key} className="block text-sm">
      <span className="text-slate-600">{f.label}</span>
      <span className="mt-0.5 flex items-center gap-1">
        {f.key === "budget" && <span className="text-slate-500">{currency}</span>}
        <input
          ref={first ? nameInput : undefined}
          className="w-full rounded border border-slate-300 px-2 py-1"
          placeholder={f.placeholder}
          inputMode={f.key === "budget" ? "decimal" : undefined}
          value={(f.key === "budget" ? (editing?.budget ?? "").replace(/^[£$]/, "") : editing?.[f.key]) ?? ""}
          onChange={(e) => editing && setEditing({ ...editing, [f.key]: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") save(false);
          }}
        />
      </span>
      {f.key === "birthday" && birthdayError && (
        <span className="text-xs text-red-700">Try a date like &quot;24/11/2015&quot; or &quot;24 Nov&quot;, or just the month.</span>
      )}
    </label>
  );

  return (
    <section className="rounded-2xl bg-white/90 p-4 text-slate-800 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold">My people</h2>
        {!editing && (
          <button
            id="add-person"
            className="rounded-full bg-emerald-700 px-3 py-1 text-sm text-white hover:bg-emerald-800"
            onClick={() => start(blank())}
          >
            + Add person
          </button>
        )}
      </div>

      {family.length === 0 && !editing && (
        <p className="text-sm text-slate-500">
          Add the people you buy for. Just a name, birthday, what they like and a budget is plenty. Or tell me about
          them in the chat.
        </p>
      )}

      <ul className="space-y-2">
        {family.map((p) => {
          const age = displayAge(p);
          return (
            <li key={p.id} className="relative rounded-xl bg-slate-50 p-2 text-sm">
              <div className="min-w-0">
                <div className="pr-24">
                  <span aria-hidden className="mr-1.5 inline-block h-7 w-7 align-middle">
                    <Face id={(p.face as FaceId | undefined) ?? faceFor(p.relationship, age)} />
                  </span>
                  <b>{p.nickname}</b>
                  {p.relationship && <span className="text-slate-500"> · {p.relationship}</span>}
                  {age && <span className="text-slate-500"> · {age}</span>}
                  {p.birthday && <span className="text-slate-500"> · 🎂 {formatBirthday(p.birthday)}</span>}
                </div>
                {/* Saved gifts first, always on show, so they are easy to find again. */}
                {(p.savedGifts?.length ?? 0) > 0 && (
                  <div className="my-1.5">
                    <div className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                      ♥ Saved {p.savedGifts!.length === 1 ? "gift" : "gifts"}
                    </div>
                    <ul className="mt-1 space-y-1">
                      {p.savedGifts!.map((g) => (
                        <li
                          key={g.title}
                          className="flex items-center justify-between gap-2 rounded-lg border border-rose-200 bg-white px-2 py-1.5 hover:border-amber-400"
                        >
                          <a
                            className="min-w-0 flex-1"
                            href={g.url}
                            target="_blank"
                            rel="sponsored nofollow noopener noreferrer"
                          >
                            <span className="font-semibold text-slate-800">🎁 {g.title}</span>
                            {g.priceBand && <span className="text-slate-500"> · {g.priceBand}</span>}
                            <span className="block text-xs font-medium text-amber-700">See options →</span>
                          </a>
                          <button
                            aria-label={`Remove ${g.title}`}
                            className="shrink-0 px-1 text-slate-400 hover:text-red-700"
                            onClick={() =>
                              setFamily(
                                family.map((x) =>
                                  x.id === p.id
                                    ? { ...x, savedGifts: (x.savedGifts ?? []).filter((s) => s.title !== g.title) }
                                    : x,
                                ),
                              )
                            }
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {p.interests && <div className="text-slate-600">Likes {p.interests}</div>}
                {p.budget && <div className="text-slate-600">Budget {p.budget}</div>}
              </div>
              <span className="absolute right-2 top-2 flex gap-2">
                <button
                  className="text-emerald-700 underline"
                  onClick={() =>
                    start({
                      ...EMPTY,
                      ...p,
                      birthday: p.birthday
                        ? `${formatBirthday(p.birthday)}${p.birthYear && p.birthday.includes("-") ? ` ${p.birthYear}` : ""}`
                        : "",
                    })
                  }
                >
                  Edit
                </button>
                <button className="text-red-700 underline" onClick={() => setFamily(family.filter((x) => x.id !== p.id))}>
                  Delete
                </button>
              </span>
            </li>
          );
        })}
      </ul>

      {editing && (
        <div className="mt-3 space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
          {justAdded && <p className="text-sm font-semibold text-emerald-800">✓ {justAdded} saved. Who&apos;s next?</p>}
          {QUICK.map((f, i) => input(f, i === 0))}
          {showMore ? (
            MORE.map((f) => input(f))
          ) : (
            <button className="text-sm text-emerald-800 underline" onClick={() => setShowMore(true)}>
              + More details (optional)
            </button>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            <button className="rounded-full bg-emerald-700 px-3 py-1 font-semibold text-white" onClick={() => save(false)}>
              Save
            </button>
            {!family.some((p) => p.id === editing.id) && (
              <button
                className="rounded-full border border-emerald-700 px-3 py-1 font-semibold text-emerald-800"
                onClick={() => save(true)}
              >
                Save &amp; add another
              </button>
            )}
            <button className="rounded-full bg-slate-200 px-3 py-1" onClick={() => start(null)}>
              {justAdded ? "Done" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      {family.length > 0 && !editing && (
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
