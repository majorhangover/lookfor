"use client";

import Face from "./Face";
import { faceFor } from "@/lib/faceFor";
import { displayAge, formatBirthday } from "@/lib/birthday";
import { applyProfileUpdate } from "@/lib/profile";
import type { Person, ProfileUpdate } from "@/lib/types";

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * As the character learns about someone in the chat, their profile card builds
 * up here, with a cartoon face. Newly learned details glow. Below it, one tap
 * adds the person (or the new details) to My people.
 */
export default function ProfileBuilder({
  family,
  pending,
  accent,
  onSave,
  onDismiss,
}: {
  family: Person[];
  pending: ProfileUpdate[];
  accent: string;
  onSave: (name: string) => void;
  onDismiss: (name: string) => void;
}) {
  const names = [...new Set(pending.map((u) => u.personNickname.trim()))].filter(Boolean);
  if (!names.length) return null;
  return (
    <>
      {names.map((name) => {
        const mine = pending.filter((u) => same(u.personNickname, name));
        const known = family.find((p) => same(p.nickname, name));
        const preview = mine.reduce(applyProfileUpdate, family).find((p) => same(p.nickname, name));
        if (!preview) return null;
        const fresh = new Set<string>(mine.map((u) => u.field));
        const age = displayAge(preview);
        const rows: [string, string, string][] = [
          ["relationship", "Who", preview.relationship],
          ["age", "Age", age],
          ["birthday", "Birthday", preview.birthday ? formatBirthday(preview.birthday) : ""],
          ["interests", "Loves", preview.interests],
          ["dislikes", "Not keen on", preview.dislikes],
          ["sizes", "Sizes", preview.sizes],
          ["budget", "Budget", preview.budget ?? ""],
          ["notes", "Notes", preview.notes],
        ];
        return (
          <section
            key={name}
            aria-label={`${name}'s profile`}
            className="profile-builder rounded-2xl bg-white/95 p-4 text-sm text-slate-800 shadow-lg"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {known ? "New details" : "Getting to know…"}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div key={faceFor(preview.relationship, age)} className="profile-face h-16 w-16 shrink-0">
                <Face id={faceFor(preview.relationship, age)} />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold">{preview.nickname}</h3>
                {preview.relationship && <p className="capitalize text-slate-600">{preview.relationship}</p>}
              </div>
            </div>
            <dl className="mt-3 space-y-1">
              {rows
                .filter(([key, , value]) => value && key !== "relationship")
                .map(([key, label, value]) => (
                  <div
                    key={`${key}:${value}`}
                    className={`profile-row flex gap-2 rounded-lg px-2 py-1 ${fresh.has(key) ? "profile-row-new" : ""}`}
                  >
                    <dt className="w-24 shrink-0 text-slate-500">{label}</dt>
                    <dd className="min-w-0">{value}</dd>
                  </div>
                ))}
            </dl>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                className="rounded-full px-4 py-2 font-semibold text-white shadow hover:opacity-90"
                style={{ background: accent }}
                onClick={() => onSave(name)}
              >
                {known ? `＋ Save to ${known.nickname}’s profile` : `＋ Add ${preview.nickname} to My people`}
              </button>
              <button className="text-slate-500 underline" onClick={() => onDismiss(name)}>
                Not now
              </button>
            </div>
          </section>
        );
      })}
    </>
  );
}
